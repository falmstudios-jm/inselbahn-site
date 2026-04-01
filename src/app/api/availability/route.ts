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
      .order('departure_time');

    if (depError) {
      console.error('Supabase departures error:', depError);
      return NextResponse.json(
        { error: 'Verfügbarkeit konnte nicht geladen werden.' },
        { status: 500 },
      );
    }

    // Fetch bookings for the given date
    const { data: bookings, error: bookError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children')
      .eq('booking_date', date)
      .in('status', ['confirmed', 'pending']);

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
        bookingCounts.set(b.departure_id, current + b.adults + b.children);
      }
    }

    // Build response slots
    const slots = (departures || []).map((dep) => {
      const tour = dep.tours as unknown as {
        id: string;
        slug: string;
        name: string;
        max_capacity: number;
        price_adult: number;
        price_child: number;
        child_age_limit: number;
      };
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
    });

    return NextResponse.json({ date, slots });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 },
    );
  }
}
