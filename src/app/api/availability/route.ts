import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Bitte geben Sie ein Datum im Format YYYY-MM-DD an.' },
        { status: 400 },
      );
    }

    // Fetch all active departures with their tour info
    const { data: departures, error: depError } = await supabase
      .from('departures')
      .select(`
        id, departure_time, is_active, notes,
        tours (id, slug, name, max_capacity, price_adult, price_child, child_age_limit)
      `)
      .eq('is_active', true)
      .eq('bookable_online', true)
      .order('departure_time');

    if (depError) {
      console.error('Supabase departures error:', depError);
      return NextResponse.json(
        { error: 'Verfügbarkeit konnte nicht geladen werden.' },
        { status: 500 },
      );
    }

    // Fetch bookings for the given date
    // Only count confirmed bookings + pending bookings less than 15 min old
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: confirmedBookings, error: confError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, ghost_seats, children_free')
      .eq('booking_date', date)
      .eq('status', 'confirmed');

    const { data: pendingBookings, error: pendError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, ghost_seats, children_free')
      .eq('booking_date', date)
      .eq('status', 'pending')
      .gte('created_at', fifteenMinAgo);

    const bookings = [...(confirmedBookings || []), ...(pendingBookings || [])];
    const bookError = confError || pendError;

    if (bookError) {
      console.error('Supabase bookings error:', bookError);
      return NextResponse.json(
        { error: 'Verfügbarkeit konnte nicht geladen werden.' },
        { status: 500 },
      );
    }

    // Build booking counts per departure
    const bookingCounts = new Map<string, number>();
    if (bookings) {
      for (const b of bookings) {
        const current = bookingCounts.get(b.departure_id) || 0;
        bookingCounts.set(b.departure_id, current + b.adults + b.children + (b.ghost_seats || 0) + (b.children_free || 0));
      }
    }

    // Current time in Berlin for 2-hour cutoff
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const nowDate = new Date(nowBerlin);
    const today = nowDate.toISOString().slice(0, 10);
    const nowHours = nowDate.getHours();
    const nowMinutes = nowDate.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;

    // Build response slots, filtering out past/too-late departures
    const slots = (departures || [])
      .map((dep) => {
        const tour = dep.tours as unknown as {
          id: string;
          slug: string;
          name: string;
          max_capacity: number;
          price_adult: number;
          price_child: number;
          child_age_limit: number;
        };

        // For today: hide departures less than 2 hours from now
        if (date === today) {
          const [depH, depM] = dep.departure_time.split(':').map(Number);
          const depTotalMinutes = depH * 60 + depM;
          if (depTotalMinutes < nowTotalMinutes + 120) {
            return null; // Too late to book — less than 2h before departure
          }
        }

        const totalBooked = bookingCounts.get(dep.id) || 0;
        const remaining = tour.max_capacity - totalBooked;

        return {
          departure_id: dep.id,
          departure_time: dep.departure_time,
          departure_notes: dep.notes,
          tour_id: tour.id,
          tour_slug: tour.slug,
          tour_name: tour.name,
          max_capacity: tour.max_capacity,
          booked: totalBooked,
          remaining: Math.max(0, remaining),
          available: remaining > 0,
          price_adult: tour.price_adult,
          price_child: tour.price_child,
          child_age_limit: tour.child_age_limit,
        };
      })
      .filter(Boolean); // Remove null entries (past departures)

    return NextResponse.json({ date, slots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 },
    );
  }
}
