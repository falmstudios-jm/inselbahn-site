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
      totalAmount: booking.total_amount,
      cancelUrl: `${BASE_URL}/booking/cancel?id=${booking.id}&token=${booking.cancel_token}`,
      ticketUrl: `${BASE_URL}/api/booking/${booking.id}/ticket?token=${booking.cancel_token}`,
      invoiceUrl,
      invoicePageUrl: `${BASE_URL}/booking/invoice`,
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
  ticketUrl: string;
  invoiceUrl: string | null;
  invoicePageUrl: string;
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
    ticketUrl,
    invoiceUrl,
    invoicePageUrl,
  } = params;

  const formattedDate = new Date(bookingDate + 'T00:00:00').toLocaleDateString(
    'de-DE',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Format time: "10:00:00" → "10:00"
  const formattedTime = departureTime.slice(0, 5);

  const passengers: string[] = [];
  passengers.push(`${adults} ${adults === 1 ? 'Erwachsener' : 'Erwachsene'}`);
  if (children > 0) passengers.push(`${children} ${children === 1 ? 'Kind' : 'Kinder'} (6–14 Jahre)`);
  if (childrenFree > 0) passengers.push(`${childrenFree} ${childrenFree === 1 ? 'Kind' : 'Kinder'} (0–5 Jahre, frei)`);

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
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${formattedDate}, ${formattedTime} Uhr</p>

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

              <!-- Ticket Download -->
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">
                Ihre Fahrkarte können Sie hier herunterladen:
              </p>
              <a href="${ticketUrl}" style="display:inline-block;background-color:#1a3a5c;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;margin-bottom:24px;">
                Fahrkarte herunterladen (PDF)
              </a>
              <br><br>

              <!-- Invoice -->
              ${invoiceUrl ? `
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">
                Ihre Rechnung:
              </p>
              <a href="${invoiceUrl}" style="display:inline-block;background-color:#e8a838;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:6px;margin-bottom:24px;">
                Rechnung herunterladen (PDF)
              </a>
              <br><br>
              ` : `
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px;">
                Benötigen Sie eine Rechnung? Sie können Ihre Rechnungsdaten jederzeit ergänzen:
              </p>
              <a href="${invoicePageUrl}" style="display:inline-block;color:#1a3a5c;font-size:14px;text-decoration:underline;margin-bottom:24px;">
                Rechnung anfordern
              </a>
              <br><br>
              `}

              <!-- Tax-free notice -->
              <p style="font-size:12px;color:#888;line-height:1.6;margin:0 0 24px;padding:12px;background-color:#f8f9fa;border-radius:6px;">
                Alle Preise sind Endpreise. Gemäß §1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
              </p>

              <!-- Cancellation -->
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 16px;">
                Kostenlose Stornierung bis Mitternacht am Vortag:
              </p>
              <a href="${cancelUrl}" style="display:inline-block;color:#c0392b;font-size:14px;text-decoration:underline;">
                Buchung stornieren
              </a>

              <!-- AGB -->
              <p style="font-size:12px;color:#888;margin:20px 0 0;">
                Es gelten unsere <a href="${BASE_URL}/agb" style="color:#1a3a5c;text-decoration:underline;">AGB</a> und <a href="${BASE_URL}/agb#stornierung" style="color:#1a3a5c;text-decoration:underline;">Stornierungsbedingungen</a>.
              </p>
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

  const { error: insertError } = await supabase.from('gift_cards').insert({
    code,
    initial_value: amount,
    remaining_value: amount,
    purchaser_email: meta.purchaser_email || null,
    purchaser_name: meta.purchaser_name || null,
    recipient_name: meta.recipient_name || null,
    recipient_message: meta.recipient_message || null,
    stripe_payment_intent_id: paymentIntent.id,
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

  const recipientSection = recipientName
    ? `
      <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Für</p>
      <p style="margin:0 0 16px;font-size:15px;color:#333;">${recipientName}</p>
      ${recipientMessage ? `
      <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Persönliche Nachricht</p>
      <p style="margin:0 0 16px;font-size:15px;color:#333;font-style:italic;">&bdquo;${recipientMessage}&ldquo;</p>
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
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a3a5c;padding:32px 24px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Inselbahn Helgoland</h1>
              <p style="color:#a3c4e0;margin:8px 0 0;font-size:14px;">Geschenkgutschein</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#1a3a5c;margin:0 0 8px;font-size:20px;">Ihr Geschenkgutschein</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                ${purchaserName ? `Hallo ${purchaserName}, v` : 'V'}ielen Dank für Ihren Kauf! Hier sind die Gutschein-Details:
              </p>

              <!-- Gift Card Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Gutscheincode</p>
                    <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a3a5c;letter-spacing:2px;">${code}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Wert</p>
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a3a5c;">${amount.toFixed(2).replace('.', ',')} &euro;</p>

                    ${recipientSection}

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Gültig bis</p>
                    <p style="margin:0;font-size:15px;color:#333;">${(() => { const d = new Date(); d.setFullYear(d.getFullYear() + 3); return d.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }); })()} (3 Jahre ab Kaufdatum)</p>
                  </td>
                </tr>
              </table>

              <!-- Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #e8a838;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">So lösen Sie den Gutschein ein</p>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.5;">
                      Geben Sie den Gutscheincode bei der Online-Buchung auf
                      <a href="${BASE_URL}" style="color:#1a3a5c;">helgolandbahn.de</a>
                      im Feld &bdquo;Gutscheincode&ldquo; ein. Der Betrag wird automatisch verrechnet.
                    </p>
                    <p style="margin:8px 0 0;font-size:14px;color:#555;line-height:1.5;">
                      Teileinlösung möglich — der Restwert bleibt erhalten.
                    </p>
                  </td>
                </tr>
              </table>
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
