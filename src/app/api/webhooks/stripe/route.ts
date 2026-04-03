import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import { Client as QStashClient } from '@upstash/qstash';
import { buildConfirmationEmail } from '@/lib/email-templates';

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
        const metaType = paymentIntent.metadata?.type;

        if (metaType === 'gift_card') {
          await confirmGiftCardAndSendEmail(paymentIntent);
          break;
        }

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

        // Mark pending booking as nopayment (payment failed) to release capacity
        await getSupabaseAdmin()
          .from('bookings')
          .update({ status: 'nopayment', cancelled_at: new Date().toISOString() })
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

        // Mark pending booking as nopayment (checkout expired) to release capacity
        await getSupabaseAdmin()
          .from('bookings')
          .update({ status: 'nopayment', cancelled_at: new Date().toISOString() })
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
  const supabase = getSupabaseAdmin();

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq('id', bookingId);

  if (updateError) {
    console.error('Error updating booking:', updateError);
    return;
  }

  // Fetch booking with related data separately
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    console.error('Error fetching booking:', fetchError);
    return;
  }

  // Fetch departure + tour
  const { data: dep } = await supabase
    .from('departures')
    .select('*, tours(*)')
    .eq('id', booking.departure_id)
    .single();

  const tour = dep?.tours;

  const hasInvoiceData = !!booking.invoice_data;
  const invoiceUrl = hasInvoiceData
    ? `${BASE_URL}/api/booking/${booking.id}/invoice?token=${booking.cancel_token}`
    : null;

  await getResend().emails.send({
    from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
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
      totalAmount: String(booking.total_amount),
      cancelUrl: `${BASE_URL}/booking/cancel?id=${booking.id}&token=${booking.cancel_token}`,
      ticketUrl: `${BASE_URL}/api/booking/${booking.id}/ticket?token=${booking.cancel_token}`,
      invoiceUrl: invoiceUrl || undefined,
    }),
  });

  // Schedule post-tour feedback email via QStash
  try {
    if (dep?.departure_time && tour?.duration_minutes) {
      const departureDateTime = new Date(`${booking.booking_date}T${dep.departure_time}`);
      const feedbackTime = new Date(departureDateTime.getTime() + (tour.duration_minutes + 20) * 60 * 1000);

      if (feedbackTime > new Date()) {
        const qstash = new QStashClient({ token: process.env.QSTASH_TOKEN! });
        await qstash.publishJSON({
          url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inselbahnhelgoland.vercel.app'}/api/feedback`,
          body: { booking_id: booking.id },
          notBefore: Math.floor(feedbackTime.getTime() / 1000),
        });
      }
    }
  } catch (qstashErr) {
    console.error('Failed to schedule feedback email via QStash:', qstashErr);
    // Don't break booking confirmation if QStash fails
  }
}


// ── Gift Card Confirmation ──

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => {
    let s = '';
    for (let i = 0; i < 4; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  };
  return `IB-GS-${block()}-${block()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function confirmGiftCardAndSendEmail(paymentIntent: any) {
  const supabase = getSupabaseAdmin();
  const meta = paymentIntent.metadata || {};

  const amount = parseFloat(meta.amount);
  const code = generateGiftCardCode();

  // §199 BGB: Verjährung beginnt am Ende des Kaufjahres + 3 Kalenderjahre
  const purchaseYear = new Date().getFullYear();
  const expiresAt = new Date(purchaseYear + 3, 11, 31).toISOString().slice(0, 10);

  const { error: insertError } = await supabase.from('gift_cards').insert({
    code,
    initial_value: amount,
    remaining_value: amount,
    purchaser_email: meta.purchaser_email || null,
    purchaser_name: meta.purchaser_name || null,
    recipient_name: meta.recipient_name || null,
    recipient_email: meta.recipient_email || null,
    stripe_payment_intent_id: paymentIntent.id,
    expires_at: expiresAt,
  });

  if (insertError) {
    console.error('Error inserting gift card:', insertError);
    return;
  }

  if (!meta.purchaser_email) return;

  await getResend().emails.send({
    from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
    to: meta.purchaser_email,
    subject: `Ihr Geschenkgutschein — Inselbahn Helgoland`,
    html: buildGiftCardEmail({
      code,
      amount,
      purchaserName: meta.purchaser_name || '',
      recipientName: meta.recipient_name || '',
      recipientMessage: meta.recipient_message || '',
    }),
  });
}

interface GiftCardEmailParams {
  code: string;
  amount: number;
  purchaserName: string;
  recipientName: string;
  recipientMessage: string;
}

function buildGiftCardEmail(params: GiftCardEmailParams): string {
  const { code, amount, purchaserName, recipientName, recipientMessage } = params;

  const validUntil = (() => {
    // §199 BGB: Verjährung beginnt am Ende des Kaufjahres + 3 Kalenderjahre
    const purchaseYear = new Date().getFullYear();
    const expiryDate = new Date(purchaseYear + 3, 11, 31); // Dec 31 of purchase year + 3
    return expiryDate.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  })();

  const recipientSection = recipientName
    ? `
      <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">F\u00FCr</p>
      <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#333;">${recipientName}</p>
      ${recipientMessage ? `
      <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Pers\u00F6nliche Nachricht</p>
      <p style="margin:0 0 16px;font-size:15px;color:#333;font-style:italic;border-left:3px solid #F24444;padding-left:12px;">&bdquo;${recipientMessage}&ldquo;</p>
      ` : ''}
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:'Montserrat',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Red top border -->
          <tr>
            <td style="background-color:#F24444;height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:28px 24px 20px;text-align:center;">
              <h1 style="color:#333333;margin:0;font-size:22px;font-weight:700;letter-spacing:2px;">INSELBAHN HELGOLAND</h1>
            </td>
          </tr>

          <!-- Celebratory Banner -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F24444;border-radius:8px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:14px;color:rgba(255,255,255,0.85);">Geschenkgutschein</p>
                    <p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">\uD83C\uDF81 Vielen Dank f\u00FCr Ihr Geschenk!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                ${purchaserName ? `Hallo ${purchaserName}, I` : 'I'}hr Gutschein wurde erfolgreich erstellt.
              </p>

              <!-- Gift Card Code - very prominent -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #F24444;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">Gutscheincode</p>
                    <p style="margin:0 0 16px;font-size:28px;font-weight:700;color:#F24444;letter-spacing:4px;font-family:'Courier New',monospace;">${code}</p>

                    <p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">Wert</p>
                    <p style="margin:0;font-size:24px;font-weight:700;color:#333333;">${amount.toFixed(2).replace('.', ',')} &euro;</p>
                  </td>
                </tr>
              </table>

              <!-- Recipient & Validity -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    ${recipientSection}
                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">G\u00FCltig bis</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${validUntil} (3 Jahre ab Kaufdatum)</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Teileinl\u00F6sung</p>
                    <p style="margin:0;font-size:15px;color:#333;">M\u00F6glich \u2014 Restwert bleibt erhalten</p>
                  </td>
                </tr>
              </table>

              <!-- Redemption Instructions -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #F24444;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">So l\u00F6sen Sie den Gutschein ein</p>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                      1. Buchen Sie eine Tour auf <a href="${BASE_URL}" style="color:#F24444;font-weight:700;">helgolandbahn.de</a><br>
                      2. Geben Sie den Gutscheincode im Feld &bdquo;Gutscheincode&ldquo; ein<br>
                      3. Der Betrag wird automatisch verrechnet
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Print Gift Card Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td>
                    <a href="${BASE_URL}/gutschein/print?code=${code}" style="display:block;background-color:#333333;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      \uD83C\uDFA8 Gutschein ausdrucken
                    </a>
                  </td>
                </tr>
              </table>
              <p style="text-align:center;font-size:12px;color:#888;margin:0 0 20px;">
                Drucken Sie eine sch\u00F6ne Geschenkkarte zum Falten aus!
              </p>

              <!-- Book Now Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td>
                    <a href="${BASE_URL}" style="display:block;background-color:#F24444;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      Jetzt Tour buchen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F7F7;padding:24px;text-align:center;border-top:1px solid #E0E0E0;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;">
                Helgol\u00E4nder Dienstleistungs GmbH \u00B7 Von-Aschen-Str. 594 \u00B7 27498 Helgoland
              </p>
              <a href="mailto:info@helgolandbahn.de" style="font-size:12px;color:#F24444;text-decoration:none;">
                info@helgolandbahn.de
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#aaa;">
                Inselbahn Helgoland \u2014 Gef\u00FChrte Inselrundfahrten
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
