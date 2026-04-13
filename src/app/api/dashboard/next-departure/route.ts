import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Check if this driver has an assigned tour (e.g. Klaus A → Premium only)
    let assignedTourId: string | null = null;
    if (session.staff_id) {
      const { data: staff } = await supabase
        .from('staff')
        .select('assigned_tour_id')
        .eq('id', session.staff_id)
        .single();
      assignedTourId = staff?.assigned_tour_id || null;
    }

    // Current Berlin time — show departure for 15 min after start (grace period for last-minute sales)
    const GRACE_MINUTES = 15;
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const now = new Date(nowBerlin);
    const today = now.toISOString().slice(0, 10);
    const graceTime = new Date(now.getTime() - GRACE_MINUTES * 60 * 1000);
    const currentTimeStr = `${String(graceTime.getHours()).padStart(2, '0')}:${String(graceTime.getMinutes()).padStart(2, '0')}:00`;

    // Fetch active departures with tour info (filtered by assigned tour if set)
    let depQuery = supabase
      .from('departures')
      .select(`
        id, departure_time, is_active, notes,
        tours (id, slug, name, max_capacity, online_capacity, price_adult, price_child)
      `)
      .eq('is_active', true)
      .gte('departure_time', currentTimeStr)
      .order('departure_time')
      .limit(1);

    if (assignedTourId) {
      depQuery = depQuery.eq('tour_id', assignedTourId);
    }

    const { data: departures, error: depError } = await depQuery;

    if (depError) {
      console.error('Next departure error:', depError);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    if (!departures || departures.length === 0) {
      // No more departures today — find the first departure tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      let tomorrowQuery = supabase
        .from('departures')
        .select(`
          id, departure_time, notes,
          tours (id, slug, name, max_capacity, online_capacity, price_adult, price_child)
        `)
        .eq('is_active', true)
        .order('departure_time')
        .limit(1);

      if (assignedTourId) {
        tomorrowQuery = tomorrowQuery.eq('tour_id', assignedTourId);
      }

      const { data: tomorrowDeps } = await tomorrowQuery;

      if (tomorrowDeps && tomorrowDeps.length > 0) {
        const tDep = tomorrowDeps[0];
        const tTour = tDep.tours as unknown as { id: string; slug: string; name: string; max_capacity: number; online_capacity: number | null; price_adult: number; price_child: number };

        // Fetch bookings for tomorrow's departure
        const { data: tBookings } = await supabase
          .from('bookings')
          .select('id, booking_reference, customer_name, adults, children, children_free, payment_method, status, total_amount, ghost_seats, wheelchair_seat, stripe_payment_intent_id, gift_card_id, notes')
          .eq('departure_id', tDep.id)
          .eq('booking_date', tomorrowStr)
          .in('status', ['confirmed', 'our_cancellation']);

        const passengers = (tBookings || [])
          .sort((a, b) => {
            if (a.customer_name === 'BLOCKIERT' || a.customer_name?.startsWith('GESPERRT')) return 1;
            if (b.customer_name === 'BLOCKIERT' || b.customer_name?.startsWith('GESPERRT')) return -1;
            const aOnline = !a.payment_method || a.payment_method === 'online';
            const bOnline = !b.payment_method || b.payment_method === 'online';
            if (aOnline && !bOnline) return -1;
            if (!aOnline && bOnline) return 1;
            return 0;
          });

        let tAdults = 0, tChildren = 0, tChildrenFree = 0, tSeats = 0;
        for (const b of tBookings || []) {
          tAdults += b.adults || 0;
          tChildren += b.children || 0;
          tChildrenFree += b.children_free || 0;
          tSeats += (b.adults || 0) + (b.children || 0) + (b.children_free || 0) + (b.ghost_seats || 0);
        }

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
            passengers,
            total_adults: tAdults,
            total_children: tChildren,
            total_children_free: tChildrenFree,
            total_seats: tSeats,
            remaining: tTour.max_capacity - tSeats,
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
