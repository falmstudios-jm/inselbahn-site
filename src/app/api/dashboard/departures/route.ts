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

    // Accept optional date param, default to today in Berlin timezone
    const dateParam = searchParams.get('date');
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const today = dateParam || new Date(nowBerlin).toISOString().slice(0, 10);

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

    // Fetch bookings for the selected date (confirmed only)
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, children_free, ghost_seats, payment_method')
      .eq('booking_date', today)
      .eq('status', 'confirmed');

    if (bookError) {
      console.error('Bookings error:', bookError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    // Fetch cancellations for this date
    const { data: cancellations } = await supabase
      .from('departure_cancellations')
      .select('departure_id, reason')
      .eq('cancelled_date', today);
    const cancelledMap = new Map<string, string>();
    for (const c of cancellations || []) {
      cancelledMap.set(c.departure_id, c.reason || 'Fällt aus');
    }

    // Build booking counts per departure with online/vor_ort breakdown
    const bookingCounts = new Map<string, { total: number; reserved: number; online: number; vor_ort: number }>();
    for (const b of bookings || []) {
      const current = bookingCounts.get(b.departure_id) || { total: 0, reserved: 0, online: 0, vor_ort: 0 };
      const passengers = b.adults + b.children + (b.children_free || 0);
      const withGhosts = passengers + (b.ghost_seats || 0);
      current.total += passengers; // Actual people coming
      current.reserved += withGhosts; // Seats reserved (incl. ghost seats)

      // Online = online/stripe/gift_card/null, Vor Ort = cash/sumup/manual_entry
      const isOnline = !b.payment_method || b.payment_method === 'online' || b.payment_method === 'stripe' || b.payment_method === 'gift_card';
      if (isOnline) {
        current.online += passengers;
      } else {
        current.vor_ort += passengers;
      }

      bookingCounts.set(b.departure_id, current);
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

      const counts = bookingCounts.get(dep.id) || { total: 0, reserved: 0, online: 0, vor_ort: 0 };

      const cancelledReason = cancelledMap.get(dep.id) || null;

      return {
        departure_id: dep.id,
        departure_time: dep.departure_time,
        tour_name: tour.name,
        tour_slug: tour.slug,
        max_capacity: tour.max_capacity,
        booked: counts.total, // Actual people
        reserved: counts.reserved, // Seats reserved (incl. ghost)
        remaining: Math.max(0, tour.max_capacity - counts.reserved), // Free seats
        online_count: counts.online,
        vor_ort_count: counts.vor_ort,
        price_adult: tour.price_adult,
        price_child: tour.price_child,
        cancelled: !!cancelledReason,
        cancelled_reason: cancelledReason,
      };
    });

    return NextResponse.json({ date: today, departures: result });
  } catch (err) {
    console.error('Dashboard departures error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
