import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { booking_id, amount, reason } = body as {
      booking_id?: string;
      amount?: number;
      reason?: string;
    };

    if (!booking_id || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { error: 'booking_id und gültiger Betrag erforderlich' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden' },
        { status: 404 }
      );
    }

    if (booking.status === 'refunded') {
      return NextResponse.json(
        { error: 'Buchung bereits erstattet' },
        { status: 400 }
      );
    }

    const totalAmount = Number(booking.total_amount);
    const refundAmount = Math.min(amount, totalAmount);
    const isFullRefund = refundAmount >= totalAmount;

    // Handle Stripe refund
    if (booking.stripe_payment_intent_id) {
      try {
        const stripe = getStripe();
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
          amount: Math.round(refundAmount * 100),
        });
      } catch (e) {
        console.error(`Stripe refund failed for booking ${booking_id}:`, e);
        return NextResponse.json(
          { error: 'Stripe-Erstattung fehlgeschlagen' },
          { status: 500 }
        );
      }
    }

    // Handle gift card restoration
    if (booking.gift_card_id) {
      try {
        const { data: usages } = await supabase
          .from('gift_card_usage')
          .select('id, amount_used, gift_card_id')
          .eq('booking_id', booking.id);

        for (const usage of usages || []) {
          const restoreAmount = isFullRefund
            ? Number(usage.amount_used)
            : Math.min(refundAmount, Number(usage.amount_used));

          const { data: card } = await supabase
            .from('gift_cards')
            .select('remaining_value')
            .eq('id', usage.gift_card_id)
            .single();

          if (card) {
            await supabase
              .from('gift_cards')
              .update({
                remaining_value: Number(card.remaining_value) + restoreAmount,
              })
              .eq('id', usage.gift_card_id);
          }
        }
      } catch (e) {
        console.error(`Gift card restore failed for booking ${booking_id}:`, e);
      }
    }

    // For cash/sumup: no external refund needed, just update status

    const notesText = [
      reason || 'Erstattung vom Dashboard',
      `Betrag: ${refundAmount.toFixed(2)}€`,
      `Erstattet von: ${session.name}`,
      booking.notes || '',
    ]
      .filter(Boolean)
      .join(' | ');

    // Update booking status
    const newStatus = isFullRefund ? 'refunded' : 'partial_refund';
    await supabase
      .from('bookings')
      .update({
        status: newStatus,
        notes: notesText,
      })
      .eq('id', booking_id);

    return NextResponse.json({
      success: true,
      status: newStatus,
      refunded_amount: refundAmount,
    });
  } catch (err) {
    console.error('Dashboard refund error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
