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

    // Optional staff_id filter (drivers see only their own)
    const staffIdFilter = searchParams.get('staff_id');

    // Fetch confirmed bookings with tour info and created_by
    let query = supabase
      .from('bookings')
      .select(`
        id, adults, children, children_free, total_amount, payment_method, created_by, notes, customer_name,
        departures (
          id, departure_time, tour_id,
          tours (name)
        )
      `)
      .eq('booking_date', today)
      .in('status', ['confirmed', 'partial_refund']);

    // Apply staff filter if provided
    if (staffIdFilter) {
      query = query.eq('created_by', staffIdFilter);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Revenue error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    const allBookings = bookings || [];

    // Total revenue
    const total_revenue = allBookings.reduce(
      (sum, b) => sum + Number(b.total_amount || 0),
      0
    );

    // Total passengers
    const total_passengers = allBookings.reduce(
      (sum, b) => sum + b.adults + b.children + (b.children_free || 0),
      0
    );

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

    // By tour
    const tourMap = new Map<string, { revenue: number; passengers: number }>();
    for (const b of allBookings) {
      const dep = b.departures as unknown as { id: string; departure_time: string; tour_id: string; tours: { name: string } };
      const tourName = dep?.tours?.name || 'Unbekannt';
      const existing = tourMap.get(tourName) || { revenue: 0, passengers: 0 };
      existing.revenue += Number(b.total_amount || 0);
      existing.passengers += b.adults + b.children + (b.children_free || 0);
      tourMap.set(tourName, existing);
    }
    const by_tour = Array.from(tourMap.entries()).map(([tour_name, data]) => ({
      tour_name,
      revenue: data.revenue,
      passengers: data.passengers,
    }));

    // By departure (per-departure breakdown)
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

    // By staff (admin only)
    let by_staff: { staff_id: string; staff_name: string; revenue: number; count: number }[] = [];
    if (session.role === 'admin' && !staffIdFilter) {
      const staffMap = new Map<string, { name: string; revenue: number; count: number }>();

      // Get staff names
      const staffIds = [...new Set(allBookings.map(b => b.created_by).filter(Boolean))];
      let staffNames: Record<string, string> = {};
      if (staffIds.length > 0) {
        const { data: staffData } = await supabase
          .from('staff')
          .select('id, name')
          .in('id', staffIds);
        if (staffData) {
          staffNames = Object.fromEntries(staffData.map(s => [s.id, s.name]));
        }
      }

      for (const b of allBookings) {
        const staffId = b.created_by || 'online';
        const staffName = staffId === 'online' ? 'Online-Buchung' : (staffNames[staffId] || 'Unbekannt');
        const existing = staffMap.get(staffId) || { name: staffName, revenue: 0, count: 0 };
        existing.revenue += Number(b.total_amount || 0);
        existing.count += 1;
        staffMap.set(staffId, existing);
      }

      by_staff = Array.from(staffMap.entries()).map(([staff_id, data]) => ({
        staff_id,
        staff_name: data.name,
        revenue: data.revenue,
        count: data.count,
      }));
    }

    return NextResponse.json({
      date: today,
      total_revenue,
      total_passengers,
      by_payment_method,
      by_tour,
      by_departure,
      by_staff,
      is_admin: session.role === 'admin',
    });
  } catch (err) {
    console.error('Dashboard revenue error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
