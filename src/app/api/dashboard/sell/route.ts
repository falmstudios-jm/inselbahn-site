import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { calculateTotal, generateBookingReference } from '@/lib/booking-utils';
import { calculateGhostSeats } from '@/lib/ghost-seats';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      departure_id,
      booking_date,
      adults = 0,
      children = 0,
      children_free = 0,
      payment_method,
      customer_name,
    } = body;

    if (!departure_id || !booking_date || !payment_method) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    if (adults === 0 && children === 0 && children_free === 0) {
      return NextResponse.json(
        { error: 'Mindestens eine Person erforderlich' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch departure + tour
    const { data: departure, error: depError } = await supabase
      .from('departures')
      .select('*, tours(*)')
      .eq('id', departure_id)
      .single();

    if (depError || !departure) {
      return NextResponse.json(
        { error: 'Abfahrt nicht gefunden' },
        { status: 400 }
      );
    }

    const tour = departure.tours;
    const capacity: number = tour.max_capacity;

    // Check availability
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('adults, children, children_free, ghost_seats')
      .eq('departure_id', departure_id)
      .eq('booking_date', booking_date)
      .eq('status', 'confirmed');

    const usedSeats = (existingBookings || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
      return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
    }, 0);

    const groupSize = adults + children + children_free;
    const ghostSeats = calculateGhostSeats(groupSize);
    const seatsNeeded = groupSize + ghostSeats;

    if (seatsNeeded > capacity - usedSeats) {
      return NextResponse.json(
        {
          error: 'Nicht genügend Plätze verfügbar',
          available: Math.max(0, capacity - usedSeats),
        },
        { status: 409 }
      );
    }

    const totalAmount = calculateTotal(
      adults,
      children,
      tour.price_adult,
      tour.price_child
    );

    const bookingReference = generateBookingReference();

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        departure_id,
        booking_date,
        adults,
        children,
        children_free,
        ghost_seats: ghostSeats,
        customer_name: customer_name || (payment_method === 'cash' ? 'Barzahlung' : 'SumUp-Zahlung'),
        customer_email: 'walkin@helgolandbahn.de',
        total_amount: totalAmount,
        booking_reference: bookingReference,
        status: 'confirmed',
        payment_method,
        created_by: session.staff_id,
      })
      .select()
      .single();

    if (insertError || !booking) {
      console.error('Sell insert error:', insertError);
      return NextResponse.json(
        { error: 'Buchung konnte nicht erstellt werden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: booking.id,
      booking_reference: bookingReference,
      total_amount: totalAmount,
    });
  } catch (err) {
    console.error('Dashboard sell error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
