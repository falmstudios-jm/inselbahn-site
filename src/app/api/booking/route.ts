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
import { buildConfirmationEmail } from '@/lib/email-templates';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://inselbahnhelgoland.vercel.app';

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

    // Check 2-hour cutoff for today's departures
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const nowDate = new Date(nowBerlin);
    const today = nowDate.toISOString().slice(0, 10);
    if (input.booking_date === today) {
      const [depH, depM] = departure.departure_time.split(':').map(Number);
      const depMinutes = depH * 60 + depM;
      const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
      if (depMinutes <= nowMinutes + 120) {
        return NextResponse.json(
          { error: 'Diese Tour kann nicht mehr online gebucht werden (weniger als 2 Stunden bis zur Abfahrt). Tickets sind vor Ort bei Tomek oder beim Fahrer erhältlich.' },
          { status: 409 }
        );
      }
    }

    // Check availability: confirmed + recent pending (< 15 min old)
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: confirmedBookings } = await supabaseAdmin
      .from('bookings')
      .select('adults, children, children_free, ghost_seats')
      .eq('departure_id', input.departure_id)
      .eq('booking_date', input.booking_date)
      .eq('status', 'confirmed');

    const { data: recentPending } = await supabaseAdmin
      .from('bookings')
      .select('adults, children, children_free, ghost_seats')
      .eq('departure_id', input.departure_id)
      .eq('booking_date', input.booking_date)
      .eq('status', 'pending')
      .gte('created_at', fifteenMinAgo);

    const existingBookings = [...(confirmedBookings || []), ...(recentPending || [])];
    const bookingsError = null;

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

    // Generate collision-safe booking reference and cancel token
    let bookingReference = generateBookingReference();
    // Check for collision and regenerate if needed (up to 5 attempts)
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('booking_reference', bookingReference)
        .maybeSingle();
      if (!existing) break;
      bookingReference = generateBookingReference();
    }
    const cancelToken = generateCancelToken();

    // Deduct gift card value if used
    let giftCardDeduction = 0;
    let giftCardId: string | null = null;
    if (input.gift_card_code) {
      const { data: gc } = await supabaseAdmin
        .from('gift_cards')
        .select('id, remaining_value')
        .eq('code', input.gift_card_code)
        .eq('is_active', true)
        .gt('remaining_value', 0)
        .single();
      if (gc) {
        giftCardDeduction = Math.min(Number(gc.remaining_value), totalPrice);
        giftCardId = gc.id;
        await supabaseAdmin
          .from('gift_cards')
          .update({ remaining_value: Number(gc.remaining_value) - giftCardDeduction })
          .eq('id', gc.id);
      }
    }

    const amountToCharge = Math.max(0, totalPrice - giftCardDeduction);

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
        invoice_data: input.invoice || null,
        wheelchair_seat: input.wheelchair_seat || false,
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

    // Record gift card usage
    if (giftCardId && giftCardDeduction > 0) {
      await supabaseAdmin.from('gift_card_usage').insert({
        gift_card_id: giftCardId,
        booking_id: booking.id,
        amount_used: giftCardDeduction,
      });
    }

    // Check if payment is skipped (gift card covers full amount)
    if (input.skip_payment || amountToCharge <= 0) {
      // Confirm booking immediately — no Stripe needed
      await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed', payment_method: 'gift_card' })
        .eq('id', booking.id);

      // Send confirmation email using branded HTML template
      try {
        const resend = new (await import('resend')).Resend(process.env.RESEND_API_KEY);
        const { data: confirmedBooking } = await supabaseAdmin
          .from('bookings')
          .select('*, departure:departures(*, tour:tours(*))')
          .eq('id', booking.id)
          .single();

        if (confirmedBooking) {
          const tour = confirmedBooking.departure?.tour;
          const dep = confirmedBooking.departure;
          const ticketUrl = `${BASE_URL}/api/booking/${booking.id}/ticket?token=${cancelToken}`;
          const cancelUrl = `${BASE_URL}/booking/cancel?id=${booking.id}&token=${cancelToken}`;
          const hasInvoiceData = !!confirmedBooking.invoice_data;
          const invoiceUrl = hasInvoiceData
            ? `${BASE_URL}/api/booking/${booking.id}/invoice?token=${cancelToken}`
            : undefined;

          await resend.emails.send({
            from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
            to: input.customer_email,
            subject: `Buchungsbestätigung ${bookingReference} — ${tour?.name || 'Inselbahn Tour'}`,
            html: buildConfirmationEmail({
              customerName: input.customer_name,
              bookingReference,
              tourName: tour?.name || 'Inselbahn Tour',
              bookingDate: input.booking_date,
              departureTime: dep?.departure_time || '',
              adults: input.adults,
              children: input.children,
              childrenFree: input.children_free,
              totalAmount: String(totalPrice),
              ticketUrl,
              cancelUrl,
              invoiceUrl,
            }),
          });
        }
      } catch (emailErr) {
        console.error('Gift card booking email error:', emailErr);
      }

      return NextResponse.json({
        skip_payment: true,
        booking_id: booking.id,
        booking_reference: bookingReference,
      });
    }

    // Create Stripe PaymentIntent for embedded payment
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amountToCharge * 100), // cents
      currency: 'eur',
      metadata: {
        type: 'booking',
        booking_id: booking.id,
        booking_reference: bookingReference,
      },
      payment_method_types: ['card', 'paypal'],
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
