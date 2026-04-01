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

    // Fetch all active departures with tour info
    const { data: departures, error: depError } = await supabase
      .from('departures')
      .select(`
        id, departure_time, is_active, notes,
        tours (id, slug, name, max_capacity, price_adult, price_child)
      `)
      .eq('is_active', true)
      .order('departure_time');

    if (depError) {
      console.error('Departures error:', depError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    // Fetch today's bookings (confirmed only for dashboard)
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, children_free, ghost_seats')
      .eq('booking_date', today)
      .eq('status', 'confirmed');

    if (bookError) {
      console.error('Bookings error:', bookError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    // Build booking counts per departure
    const bookingCounts = new Map<string, number>();
    for (const b of bookings || []) {
      const current = bookingCounts.get(b.departure_id) || 0;
      bookingCounts.set(
        b.departure_id,
        current + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0)
      );
    }

    const result = (departures || []).map((dep) => {
      const tour = dep.tours as unknown as {
        id: string;
        slug: string;
        name: string;
        max_capacity: number;
        price_adult: number;
        price_child: number;
      };

      const booked = bookingCounts.get(dep.id) || 0;

      return {
        departure_id: dep.id,
        departure_time: dep.departure_time,
        tour_name: tour.name,
        tour_slug: tour.slug,
        max_capacity: tour.max_capacity,
        booked,
        remaining: Math.max(0, tour.max_capacity - booked),
        price_adult: tour.price_adult,
        price_child: tour.price_child,
      };
    });

    return NextResponse.json({ date: today, departures: result });
  } catch (err) {
    console.error('Dashboard departures error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
