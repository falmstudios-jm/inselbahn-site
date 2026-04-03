import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);

    // Accept optional date param, default to today
    const dateParam = searchParams.get('date');
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const today = dateParam || new Date(nowBerlin).toISOString().slice(0, 10);

    // Only return this staff member's sales
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, adults, children, children_free, total_amount, payment_method, notes,
        departures (
          id, departure_time, tour_id,
          tours (name)
        )
      `)
      .eq('booking_date', today)
      .eq('status', 'confirmed')
      .eq('created_by', session.staff_id);

    if (error) {
      console.error('My revenue error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    const allBookings = bookings || [];

    const total_revenue = allBookings.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0
    );

    const total_passengers = allBookings.reduce(
      (sum, b) => sum + b.adults + b.children + (b.children_free || 0),
      0
    );

    const total_bookings = allBookings.length;

    // By payment method
    const methodMap = new Map<string, { revenue: number; count: number }>();
    for (const b of allBookings) {
      const method = b.payment_method || 'stripe';
      const existing = methodMap.get(method) || { revenue: 0, count: 0 };
      existing.revenue += Number(b.total_amount || 0);
      existing.count += 1;
      methodMap.set(method, existing);
    }
    const by_payment_method = Array.from(methodMap.entries()).map(
      ([method, data]) => ({
        method,
        revenue: data.revenue,
        count: data.count,
      })
    );

    // By departure
    const depMap = new Map<string, { departure_time: string; tour_name: string; revenue: number; passengers: number }>();
    for (const b of allBookings) {
      const dep = b.departures as unknown as { id: string; departure_time: string; tour_id: string; tours: { name: string } };
      const depId = dep?.id || 'unknown';
      const existing = depMap.get(depId) || {
        departure_time: dep?.departure_time || '',
        tour_name: dep?.tours?.name || 'Unbekannt',
        revenue: 0,
        passengers: 0,
      };
      existing.revenue += Number(b.total_amount || 0);
      existing.passengers += b.adults + b.children + (b.children_free || 0);
      depMap.set(depId, existing);
    }
    const by_departure = Array.from(depMap.entries()).map(([departure_id, data]) => ({
      departure_id,
      ...data,
    })).sort((a, b) => a.departure_time.localeCompare(b.departure_time));

    return NextResponse.json({
      date: today,
      staff_name: session.name,
      total_revenue,
      total_passengers,
      total_bookings,
      by_payment_method,
      by_departure,
    });
  } catch (err) {
    console.error('My revenue error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
