import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';
import { calculateGhostSeats } from '@/lib/ghost-seats';
import {
  bookingSchema,
  calculateTotal,
  generateBookingReference,
  generateCancelToken,
} from '@/lib/booking-utils';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch departure + tour details
    const { data: departure, error: depError } = await supabaseAdmin
      .from('departures')
      .select('*, tours(*)')
      .eq('id', input.departure_id)
      .single();

    if (depError || !departure) {
      return NextResponse.json(
        { error: 'Abfahrt nicht gefunden' },
        { status: 400 }
      );
    }

    const tour = departure.tours;
    const capacity: number = tour.max_capacity;

    // Check availability: count existing bookings for this departure + date
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('adults, children, children_free, ghost_seats')
      .eq('departure_id', input.departure_id)
      .eq('booking_date', input.booking_date)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) {
      return NextResponse.json(
        { error: 'Fehler bei der Verfügbarkeitsprüfung' },
        { status: 500 }
      );
    }

    const usedSeats = (existingBookings || []).reduce((sum, b) => {
      return sum + b.adults + b.children + b.children_free + (b.ghost_seats || 0);
    }, 0);

    // Calculate ghost seats for this booking
    const groupSize = input.adults + input.children + input.children_free;
    const ghostSeats = calculateGhostSeats(groupSize);
    const seatsNeeded = groupSize + ghostSeats;

    const remainingCapacity = capacity - usedSeats;
    if (seatsNeeded > remainingCapacity) {
      return NextResponse.json(
        {
          error: 'Nicht genügend Plätze verfügbar',
          available: Math.max(0, remainingCapacity),
        },
        { status: 409 }
      );
    }

    // Calculate total price
    const totalPrice = calculateTotal(
      input.adults,
      input.children,
      tour.price_adult,
      tour.price_child
    );

    // Generate booking reference and cancel token
    const bookingReference = generateBookingReference();
    const cancelToken = generateCancelToken();

    // Insert booking as 'pending'
    const { data: booking, error: insertError } = await supabaseAdmin
      .from('bookings')
      .insert({
        departure_id: input.departure_id,
        booking_date: input.booking_date,
        adults: input.adults,
        children: input.children,
        children_free: input.children_free,
        ghost_seats: ghostSeats,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone || null,
        total_amount: totalPrice,
        booking_reference: bookingReference,
        cancel_token: cancelToken,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError || !booking) {
      console.error('Booking insert error:', insertError);
      return NextResponse.json(
        { error: 'Buchung konnte nicht erstellt werden' },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent for embedded payment
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: 'eur',
      metadata: {
        booking_id: booking.id,
        booking_reference: bookingReference,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      booking_id: booking.id,
      booking_reference: bookingReference,
    });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
