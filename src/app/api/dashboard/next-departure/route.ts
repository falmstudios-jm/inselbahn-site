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

    // Current Berlin time
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const now = new Date(nowBerlin);
    const today = now.toISOString().slice(0, 10);
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    // Fetch all active departures with tour info
    const { data: departures, error: depError } = await supabase
      .from('departures')
      .select(`
        id, departure_time, is_active, notes,
        tours (id, slug, name, max_capacity, online_capacity, price_adult, price_child)
      `)
      .eq('is_active', true)
      .gte('departure_time', currentTimeStr)
      .order('departure_time')
      .limit(1);

    if (depError) {
      console.error('Next departure error:', depError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    if (!departures || departures.length === 0) {
      // No more departures today — find the first departure tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const { data: tomorrowDeps } = await supabase
        .from('departures')
        .select(`
          id, departure_time, notes,
          tours (id, slug, name, max_capacity, online_capacity, price_adult, price_child)
        `)
        .eq('is_active', true)
        .order('departure_time')
        .limit(1);

      if (tomorrowDeps && tomorrowDeps.length > 0) {
        const tDep = tomorrowDeps[0];
        const tTour = tDep.tours as unknown as { id: string; slug: string; name: string; max_capacity: number; online_capacity: number | null; price_adult: number; price_child: number };
        return NextResponse.json({
          date: tomorrowStr,
          current_time: now.toISOString(),
          is_tomorrow: true,
          next_departure: {
            departure_id: tDep.id,
            departure_time: tDep.departure_time,
            tour_name: tTour.name,
            tour_slug: tTour.slug,
            max_capacity: tTour.max_capacity,
            online_capacity: tTour.online_capacity,
            price_adult: tTour.price_adult,
            price_child: tTour.price_child,
            passengers: [],
            total_adults: 0,
            total_children: 0,
            total_children_free: 0,
            total_seats: 0,
            remaining: tTour.max_capacity,
          },
        });
      }

      return NextResponse.json({
        date: today,
        current_time: now.toISOString(),
        next_departure: null,
      });
    }

    const dep = departures[0];
    const tour = dep.tours as unknown as {
      id: string;
      slug: string;
      name: string;
      max_capacity: number;
      online_capacity: number | null;
      price_adult: number;
      price_child: number;
    };

    // Fetch all bookings for this departure + today
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('id, customer_name, adults, children, children_free, ghost_seats, payment_method, booking_reference, status, total_amount, notes, created_at')
      .eq('departure_id', dep.id)
      .eq('booking_date', today)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });

    if (bookError) {
      console.error('Bookings error:', bookError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    const passengerList = bookings || [];

    // Calculate totals
    let totalAdults = 0;
    let totalChildren = 0;
    let totalChildrenFree = 0;
    let totalSeats = 0;

    for (const b of passengerList) {
      totalAdults += b.adults;
      totalChildren += b.children;
      totalChildrenFree += b.children_free || 0;
      totalSeats += b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
    }

    // Sort: online bookings first, then walk-ups, blocked last
    const sorted = [...passengerList].sort((a, b) => {
      const aBlocked = a.customer_name === 'BLOCKIERT' ? 1 : 0;
      const bBlocked = b.customer_name === 'BLOCKIERT' ? 1 : 0;
      if (aBlocked !== bBlocked) return aBlocked - bBlocked;

      const aOnline = !a.payment_method || a.payment_method === 'stripe' ? 0 : 1;
      const bOnline = !b.payment_method || b.payment_method === 'stripe' ? 0 : 1;
      if (aOnline !== bOnline) return aOnline - bOnline;

      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return NextResponse.json({
      date: today,
      current_time: now.toISOString(),
      next_departure: {
        departure_id: dep.id,
        departure_time: dep.departure_time,
        tour_name: tour.name,
        tour_slug: tour.slug,
        max_capacity: tour.max_capacity,
        online_capacity: tour.online_capacity,
        price_adult: tour.price_adult,
        price_child: tour.price_child,
        total_adults: totalAdults,
        total_children: totalChildren,
        total_children_free: totalChildrenFree,
        total_seats: totalSeats,
        remaining: Math.max(0, tour.max_capacity - totalSeats),
        passengers: sorted,
      },
    });
  } catch (err) {
    console.error('Next departure error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
