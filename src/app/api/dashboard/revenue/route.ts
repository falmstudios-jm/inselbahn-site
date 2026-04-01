import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Get today's date in Berlin timezone
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const today = new Date(nowBerlin).toISOString().slice(0, 10);

    // Fetch today's confirmed bookings with tour info
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id, adults, children, children_free, total_amount, payment_method,
        departures (
          tour_id,
          tours (name)
        )
      `)
      .eq('booking_date', today)
      .eq('status', 'confirmed');

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
      const dep = b.departures as unknown as { tour_id: string; tours: { name: string } };
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

    return NextResponse.json({
      total_revenue,
      total_passengers,
      by_payment_method,
      by_tour,
    });
  } catch (err) {
    console.error('Dashboard revenue error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
