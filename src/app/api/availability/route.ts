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

    // Fetch all active departures with their tour info (including non-online-bookable ones)
    const { data: departures, error: depError } = await supabase
      .from('departures')
      .select(`
        id, departure_time, is_active, notes, bookable_online,
        tours (id, slug, name, max_capacity, online_capacity, price_adult, price_child, child_age_limit)
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
    // Only count confirmed bookings + pending bookings less than 10 min old
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    const { data: confirmedBookings, error: confError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, ghost_seats, children_free, wheelchair_seat, customer_name, status')
      .eq('booking_date', date)
      .in('status', ['confirmed', 'our_cancellation']);

    const { data: pendingBookings, error: pendError } = await supabase
      .from('bookings')
      .select('departure_id, adults, children, ghost_seats, children_free, wheelchair_seat')
      .eq('booking_date', date)
      .eq('status', 'pending')
      .gte('created_at', tenMinAgo);

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
    const bookingCounts = new Map<string, number>(); // total including ghost seats
    const passengerCounts = new Map<string, number>(); // passengers only (no ghost seats)
    const wheelchairBooked = new Map<string, boolean>();
    const cancelledDepartures = new Set<string>();
    if (bookings) {
      for (const b of bookings) {
        const total = b.adults + b.children + (b.ghost_seats || 0) + (b.children_free || 0);
        const passengers = b.adults + b.children + (b.children_free || 0);
        bookingCounts.set(b.departure_id, (bookingCounts.get(b.departure_id) || 0) + total);
        passengerCounts.set(b.departure_id, (passengerCounts.get(b.departure_id) || 0) + passengers);
        if (b.wheelchair_seat) {
          wheelchairBooked.set(b.departure_id, true);
        }
      }
    }
    // Detect GESPERRT/our_cancellation bookings = departure is cancelled by operator
    if (confirmedBookings) {
      for (const b of confirmedBookings) {
        if (b.status === 'our_cancellation' && b.customer_name?.startsWith('GESPERRT')) {
          cancelledDepartures.add(b.departure_id);
        }
      }
    }

    // Fetch online cutoff from site_settings (default 20 minutes)
    let cutoffMinutes = 20;
    try {
      const { data: cutoffSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'online_cutoff_minutes')
        .single();
      if (cutoffSetting?.value) {
        cutoffMinutes = parseInt(cutoffSetting.value, 10) || 20;
      }
    } catch {
      // Use default if setting doesn't exist
    }

    // Current time in Berlin for cutoff
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const nowDate = new Date(nowBerlin);
    const today = nowDate.toISOString().slice(0, 10);
    const nowHours = nowDate.getHours();
    const nowMinutes = nowDate.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;

    // Build response slots, including past departures with a flag
    const slots = (departures || [])
      .map((dep) => {
        const tour = dep.tours as unknown as {
          id: string;
          slug: string;
          name: string;
          max_capacity: number;
          online_capacity: number | null;
          price_adult: number;
          price_child: number;
          child_age_limit: number;
        };

        // For today: flag departures within the cutoff window as past
        let isPast = false;
        if (date === today) {
          const [depH, depM] = dep.departure_time.split(':').map(Number);
          const depTotalMinutes = depH * 60 + depM;
          if (depTotalMinutes < nowTotalMinutes + cutoffMinutes) {
            isPast = true;
          }
        }

        const totalBooked = bookingCounts.get(dep.id) || 0;
        // Online capacity = max sellable passengers online (e.g. 16)
        // Physical capacity = absolute max including ghost seats (e.g. 18)
        // Ghost seats overflow into reserve (physical - online) so they don't reduce available slots
        const onlineCap = tour.online_capacity ?? tour.max_capacity;

        // Count only actual passengers (not ghost seats) against online capacity
        // Ghost seats use the physical reserve, not online slots
        const usedPassengers = passengerCounts.get(dep.id) || 0;
        const onlineRemaining = onlineCap - usedPassengers;
        const physicalRemaining = tour.max_capacity - totalBooked;

        return {
          departure_id: dep.id,
          departure_time: dep.departure_time,
          departure_notes: dep.notes,
          tour_id: tour.id,
          tour_slug: tour.slug,
          tour_name: tour.name,
          max_capacity: onlineCap, // Show online capacity as "max" to customers (not physical 18)
          online_capacity: onlineCap,
          booked: usedPassengers, // Show passenger count (not including ghost seats)
          remaining: Math.max(0, Math.min(onlineRemaining, physicalRemaining)), // Stricter of both limits
          physical_remaining: Math.max(0, physicalRemaining), // For dashboard
          available: Math.min(onlineRemaining, physicalRemaining) > 0,
          online_sold_out: Math.min(onlineRemaining, physicalRemaining) <= 0 && physicalRemaining > 0,
          bookable_online: dep.bookable_online !== false,
          past: isPast,
          price_adult: tour.price_adult,
          price_child: tour.price_child,
          child_age_limit: tour.child_age_limit,
          wheelchair_available: !wheelchairBooked.get(dep.id),
          cancelled: cancelledDepartures.has(dep.id),
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
