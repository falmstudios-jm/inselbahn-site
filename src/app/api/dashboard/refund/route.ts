import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { getStripe } from '@/lib/stripe';
import { Resend } from 'resend';

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

    // Send refund email if customer has a real email
    if (booking.customer_email && !booking.customer_email.includes('walkin@')) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const formattedAmount = refundAmount.toFixed(2).replace('.', ',');
        const isOnline = booking.stripe_payment_intent_id;

        await resend.emails.send({
          from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
          to: booking.customer_email,
          subject: `Erstattung ${booking.booking_reference} - ${formattedAmount} EUR`,
          html: `<!DOCTYPE html><html><body style="font-family:Helvetica,Arial,sans-serif;margin:0;padding:0;background:#f7f7f7;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
<tr><td style="background:#F24444;padding:24px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:18px;">INSELBAHN HELGOLAND</h1>
</td></tr>
<tr><td style="padding:32px 24px;">
<h2 style="margin:0 0 16px;font-size:20px;color:#333;">Erstattung bearbeitet</h2>
<p style="color:#555;font-size:14px;line-height:1.6;">
Hallo ${booking.customer_name},<br><br>
wir haben eine ${isFullRefund ? 'vollständige' : 'teilweise'} Erstattung für Ihre Buchung <strong>${booking.booking_reference}</strong> veranlasst.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;border-radius:8px;margin:20px 0;">
<tr><td style="padding:16px;">
<p style="margin:0 0 8px;font-size:13px;color:#888;">Erstattungsbetrag</p>
<p style="margin:0;font-size:24px;font-weight:700;color:#333;">${formattedAmount} &euro;</p>
</td></tr></table>
${reason ? `<p style="color:#555;font-size:14px;">Grund: ${reason}</p>` : ''}
<p style="color:#555;font-size:14px;line-height:1.6;">
${isOnline ? 'Die Rückerstattung erfolgt in der Regel innerhalb weniger Minuten auf Ihr ursprüngliches Zahlungsmittel. In seltenen Fällen kann es bis zu 5-10 Werktage dauern.' : 'Die Erstattung wurde vor Ort veranlasst.'}
</p>
<p style="color:#555;font-size:14px;line-height:1.6;">
Wir würden uns freuen, Sie bald wieder auf Helgoland begrüßen zu dürfen!
</p>
<a href="https://www.helgolandbahn.de/#buchung" style="display:inline-block;background:#F24444;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;margin-top:8px;">
Neue Tour buchen
</a>
</td></tr>
<tr><td style="background:#f7f7f7;padding:16px;text-align:center;border-top:1px solid #e0e0e0;">
<p style="margin:0;font-size:11px;color:#aaa;">Helgoländer Dienstleistungs GmbH - Von-Aschen-Str. 594 - 27498 Helgoland</p>
</td></tr></table></td></tr></table></body></html>`,
        });
      } catch (emailErr) {
        console.error('Refund email failed:', emailErr);
        // Don't fail the refund if email fails
      }
    }

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
