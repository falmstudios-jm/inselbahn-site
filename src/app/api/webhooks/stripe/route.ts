import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── New: Embedded payment via PaymentIntent ──
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (!bookingId) {
          console.error('No booking_id in paymentIntent metadata');
          break;
        }

        await confirmBookingAndSendEmail(bookingId, paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (!bookingId) break;

        // Delete pending booking to release capacity
        await getSupabaseAdmin()
          .from('bookings')
          .delete()
          .eq('id', bookingId)
          .eq('status', 'pending');

        break;
      }

      // ── Legacy: Stripe Checkout redirect (kept for safety) ──
      case 'checkout.session.completed': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;

        if (!bookingId) {
          console.error('No booking_id in session metadata');
          break;
        }

        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null;

        await confirmBookingAndSendEmail(bookingId, paymentIntentId);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const bookingId = session.metadata?.booking_id;

        if (!bookingId) break;

        // Delete pending booking to release capacity
        await getSupabaseAdmin()
          .from('bookings')
          .delete()
          .eq('id', bookingId)
          .eq('status', 'pending');

        break;
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function confirmBookingAndSendEmail(bookingId: string, paymentIntentId: string | null) {
  const { data: booking, error: updateError } = await getSupabaseAdmin()
    .from('bookings')
    .update({
      status: 'confirmed',
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', bookingId)
    .select(
      '*, departures:departure_id(*, tours:tour_id(*))'
    )
    .single();

  if (updateError || !booking) {
    console.error('Error updating booking:', updateError);
    return;
  }

  // Send confirmation email
  const dep = booking.departures;
  const tour = dep?.tours;

  await getResend().emails.send({
    // TODO: Change to 'Inselbahn Helgoland <buchung@helgolandbahn.de>' once Resend domain is verified
    from: 'Inselbahn Helgoland <onboarding@resend.dev>',
    to: booking.customer_email,
    subject: `Buchungsbestätigung ${booking.booking_reference} — Inselbahn Helgoland`,
    html: buildConfirmationEmail({
      bookingReference: booking.booking_reference,
      customerName: booking.customer_name,
      tourName: tour?.name || 'Inselbahn Tour',
      bookingDate: booking.booking_date,
      departureTime: dep?.departure_time || '',
      adults: booking.adults,
      children: booking.children,
      childrenFree: booking.children_free,
      totalAmount: booking.total_amount,
      cancelUrl: `${BASE_URL}/booking/cancel?id=${booking.id}&token=${booking.cancel_token}`,
    }),
  });
}

interface EmailParams {
  bookingReference: string;
  customerName: string;
  tourName: string;
  bookingDate: string;
  departureTime: string;
  adults: number;
  children: number;
  childrenFree: number;
  totalAmount: number;
  cancelUrl: string;
}

function buildConfirmationEmail(params: EmailParams): string {
  const {
    bookingReference,
    customerName,
    tourName,
    bookingDate,
    departureTime,
    adults,
    children,
    childrenFree,
    totalAmount,
    cancelUrl,
  } = params;

  const formattedDate = new Date(bookingDate + 'T00:00:00').toLocaleDateString(
    'de-DE',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  const passengers: string[] = [];
  passengers.push(`${adults} Erwachsene`);
  if (children > 0) passengers.push(`${children} Kinder (6–14 Jahre)`);
  if (childrenFree > 0) passengers.push(`${childrenFree} Kinder (0–5 Jahre, frei)`);

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Inselbahn Helgoland</h1>
              <p style="color:#a3c4e0;margin:8px 0 0;font-size:14px;">Geführte Inselrundfahrten</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#1a3a5c;margin:0 0 8px;font-size:20px;">Vielen Dank für Ihre Buchung!</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, Ihre Buchung wurde erfolgreich bestätigt.
              </p>

              <!-- Booking Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Buchungsnummer</p>
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a3a5c;">${bookingReference}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum &amp; Uhrzeit</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${formattedDate}, ${departureTime} Uhr</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Fahrgäste</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${passengers.join(', ')}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Gesamtpreis</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#1a3a5c;">${totalAmount.toFixed(2).replace('.', ',')} €</p>
                  </td>
                </tr>
              </table>

              <!-- Meeting Point -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #e8a838;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">Treffpunkt</p>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.5;">
                      Franz-Schensky-Platz, Helgoland<br>
                      Bitte seien Sie <strong>15 Minuten vor Abfahrt</strong> am Treffpunkt.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Cancellation -->
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
                Kostenlose Stornierung bis Mitternacht am Vortag:
              </p>
              <a href="${cancelUrl}" style="display:inline-block;color:#c0392b;font-size:14px;text-decoration:underline;">
                Buchung stornieren
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="margin:0 0 4px;font-size:13px;color:#888;">
                Fragen? Kontaktieren Sie uns:
              </p>
              <a href="mailto:info@helgolandbahn.de" style="font-size:13px;color:#1a3a5c;text-decoration:none;">
                info@helgolandbahn.de
              </a>
              <p style="margin:16px 0 0;font-size:11px;color:#aaa;">
                Inselbahn Helgoland — Geführte Inselrundfahrten
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
