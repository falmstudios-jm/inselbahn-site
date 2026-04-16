import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/dashboard-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const FALMSTUDIOS_FEE_PER_PASSENGER = 0.8; // 0.80 EUR per online passenger

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Administratoren haben Zugriff.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date und end_date erforderlich.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // ── Fetch bookings for the period ──
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(
        '*, departures:departure_id(departure_time, tour_id, tours:tour_id(name, slug, max_capacity))'
      )
      .gte('booking_date', startDate)
      .lte('booking_date', endDate)
      .in('status', ['confirmed', 'partial_refund']);

    if (bookingsError) {
      console.error('Analytics bookings error:', bookingsError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Buchungen.' },
        { status: 500 }
      );
    }

    const allBookings = bookings || [];

    // ── Fetch bookings for comparison period (same length, previous period) ──
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    const periodLength = endMs - startMs;
    const prevStart = new Date(startMs - periodLength - 86400000)
      .toISOString()
      .slice(0, 10);
    const prevEnd = new Date(startMs - 86400000).toISOString().slice(0, 10);

    const { data: prevBookings } = await supabase
      .from('bookings')
      .select('total_amount, adults, children, children_free')
      .gte('booking_date', prevStart)
      .lte('booking_date', prevEnd)
      .in('status', ['confirmed', 'partial_refund']);

    const prevAll = prevBookings || [];

    // ── Calculate main stats ──
    const totalRevenue = allBookings.reduce(
      (sum, b) => sum + Number(b.total_amount),
      0
    );
    const totalBookings = allBookings.length;
    const totalPassengers = allBookings.reduce(
      (sum, b) => sum + b.adults + b.children + (b.children_free || 0),
      0
    );
    const avgBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Previous period stats
    const prevRevenue = prevAll.reduce(
      (sum, b) => sum + Number(b.total_amount),
      0
    );
    const prevBookingsCount = prevAll.length;
    const prevPassengers = prevAll.reduce(
      (sum, b) => sum + b.adults + b.children + (b.children_free || 0),
      0
    );

    // ── Revenue by tour ──
    const revenueByTour: Record<string, { revenue: number; bookings: number }> =
      {};
    for (const b of allBookings) {
      const dep = b.departures as unknown as {
        tours: { name: string; slug: string };
      } | null;
      const tourName = dep?.tours?.name || 'Unbekannt';
      if (!revenueByTour[tourName]) {
        revenueByTour[tourName] = { revenue: 0, bookings: 0 };
      }
      revenueByTour[tourName].revenue += Number(b.total_amount);
      revenueByTour[tourName].bookings += 1;
    }

    // ── Revenue by payment method ──
    // Online = has stripe_payment_intent_id, Cash/SumUp = does not
    const onlineBookings = allBookings.filter(
      (b) => b.stripe_payment_intent_id
    );
    const cashBookings = allBookings.filter(
      (b) => !b.stripe_payment_intent_id
    );

    const revenueByPayment = {
      online: {
        count: onlineBookings.length,
        revenue: onlineBookings.reduce(
          (sum, b) => sum + Number(b.total_amount),
          0
        ),
      },
      bar_sumup: {
        count: cashBookings.length,
        revenue: cashBookings.reduce(
          (sum, b) => sum + Number(b.total_amount),
          0
        ),
      },
    };

    // ── Occupancy per departure time ──
    const occupancyMap: Record<
      string,
      { booked: number; capacity: number; count: number }
    > = {};
    for (const b of allBookings) {
      const dep = b.departures as unknown as {
        departure_time: string;
        tours: { name: string; max_capacity: number };
      } | null;
      if (!dep) continue;
      const time = dep.departure_time?.slice(0, 5) || '??:??';
      const tourName = dep.tours?.name || '';
      const key = `${time} ${tourName}`;
      const capacity = dep.tours?.max_capacity || 42;
      if (!occupancyMap[key]) {
        occupancyMap[key] = { booked: 0, capacity, count: 0 };
      }
      occupancyMap[key].booked +=
        b.adults + b.children + (b.children_free || 0);
      occupancyMap[key].count += 1;
    }

    // Calculate average fill rate per departure
    const occupancy = Object.entries(occupancyMap).map(([key, val]) => {
      // Estimate number of days this departure ran
      const daysInPeriod = Math.max(
        1,
        Math.ceil((endMs - startMs) / 86400000) + 1
      );
      const totalCapacity = val.capacity * daysInPeriod;
      const fillRate =
        totalCapacity > 0
          ? Math.round((val.booked / totalCapacity) * 100)
          : 0;
      return {
        departure: key,
        booked: val.booked,
        capacity: val.capacity,
        fillRate: Math.min(100, fillRate),
      };
    });

    // ── Chat log stats ──
    const { data: chatLogs } = await supabase
      .from('chat_logs')
      .select('topics, status')
      .gte('created_at', new Date(startDate + 'T00:00:00Z').toISOString())
      .lte(
        'created_at',
        new Date(endDate + 'T23:59:59Z').toISOString()
      );

    const allLogs = chatLogs || [];
    const topicCounts: Record<string, number> = {};
    let successCount = 0;
    let totalChats = allLogs.length;

    for (const log of allLogs) {
      if (log.status === 'success') successCount++;
      for (const topic of log.topics || []) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    const chatSuccessRate =
      totalChats > 0 ? Math.round((successCount / totalChats) * 100) : 0;

    // ── falmstudios fee ── (per online passenger, not per booking)
    const onlineConfirmedCount = onlineBookings.length;
    const onlinePassengerCount = onlineBookings.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sum, b: any) => sum + (b.adults || 0) + (b.children || 0) + (b.children_free || 0),
      0
    );
    const falmstudiosFee = onlinePassengerCount * FALMSTUDIOS_FEE_PER_PASSENGER;

    // Next billing date: 1st of next month
    const now = new Date();
    const nextBillingDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    )
      .toISOString()
      .slice(0, 10);

    return NextResponse.json({
      period: { start_date: startDate, end_date: endDate },
      summary: {
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        total_passengers: totalPassengers,
        avg_booking_value: Math.round(avgBookingValue * 100) / 100,
      },
      comparison: {
        prev_revenue: prevRevenue,
        prev_bookings: prevBookingsCount,
        prev_passengers: prevPassengers,
        revenue_change:
          prevRevenue > 0
            ? Math.round(
                ((totalRevenue - prevRevenue) / prevRevenue) * 100
              )
            : null,
      },
      revenue_by_tour: revenueByTour,
      revenue_by_payment: revenueByPayment,
      occupancy,
      chat: {
        total_chats: totalChats,
        success_rate: chatSuccessRate,
        top_topics: topTopics,
      },
      falmstudios: {
        online_bookings: onlineConfirmedCount,
        online_passengers: onlinePassengerCount,
        fee_per_passenger: FALMSTUDIOS_FEE_PER_PASSENGER,
        total_fee: Math.round(falmstudiosFee * 100) / 100,
        next_billing_date: nextBillingDate,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json(
      { error: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
