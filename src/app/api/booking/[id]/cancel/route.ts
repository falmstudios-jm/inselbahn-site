import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';
import { Resend } from 'resend';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { cancel_token } = body;

    if (!cancel_token) {
      return NextResponse.json(
        { error: 'Stornierungstoken fehlt' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, departures:departure_id(*, tours:tour_id(*))')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden' },
        { status: 404 }
      );
    }

    // Validate cancel token
    if (booking.cancel_token !== cancel_token) {
      return NextResponse.json(
        { error: 'Ungültiger Stornierungslink' },
        { status: 403 }
      );
    }

    // Check if already cancelled/refunded
    if (booking.status === 'refunded' || booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Diese Buchung wurde bereits storniert' },
        { status: 409 }
      );
    }

    // Check if booking is confirmed (only confirmed bookings can be cancelled)
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Nur bestätigte Buchungen können storniert werden' },
        { status: 400 }
      );
    }

    // Check cancellation deadline: midnight Berlin time on the booking date.
    // If now (Berlin) >= midnight on booking day → too late to cancel.
    // So for a booking on April 4th, cancellation is allowed until 23:59:59 on April 3rd Berlin time.

    // Get current time in Berlin
    const now = new Date();
    const berlinNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

    // Deadline is midnight Berlin time on the booking date
    // booking.booking_date is "YYYY-MM-DD", so this creates midnight local (server) time,
    // but we compare against berlinNow which is also converted to Berlin local time.
    const bookingDate = new Date(booking.booking_date + 'T00:00:00');

    if (berlinNow >= bookingDate) {
      return NextResponse.json(
        {
          error:
            'Stornierung nicht mehr möglich. Die kostenlose Stornierung ist nur bis Mitternacht am Vortag möglich.',
        },
        { status: 409 }
      );
    }

    // Issue Stripe refund
    if (booking.stripe_payment_intent_id) {
      try {
        await getStripe().refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
      } catch (stripeErr) {
        console.error('Stripe refund error:', stripeErr);
        return NextResponse.json(
          { error: 'Erstattung konnte nicht verarbeitet werden. Bitte kontaktieren Sie uns.' },
          { status: 500 }
        );
      }
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'refunded',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Booking update error:', updateError);
      return NextResponse.json(
        { error: 'Buchung konnte nicht aktualisiert werden' },
        { status: 500 }
      );
    }

    // Send cancellation confirmation email
    const tour = booking.departures?.tours;
    const formattedDate = new Date(
      booking.booking_date + 'T00:00:00'
    ).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    try {
      await getResend().emails.send({
        from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
        to: booking.customer_email,
        subject: `Stornierungsbestätigung ${booking.booking_reference} — Inselbahn Helgoland`,
        html: buildCancellationEmail({
          bookingReference: booking.booking_reference,
          customerName: booking.customer_name,
          tourName: tour?.name || 'Inselbahn Tour',
          bookingDate: formattedDate,
          totalAmount: booking.total_amount,
        }),
      });
    } catch (emailErr) {
      // Log but don't fail — refund is already issued
      console.error('Cancellation email error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Buchung erfolgreich storniert',
    });
  } catch (err) {
    console.error('Cancel error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

interface CancelEmailParams {
  bookingReference: string;
  customerName: string;
  tourName: string;
  bookingDate: string;
  totalAmount: number;
}

function buildCancellationEmail(params: CancelEmailParams): string {
  const { bookingReference, customerName, tourName, bookingDate, totalAmount } =
    params;

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

          <!-- Cancellation Banner -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F24444;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Buchung storniert</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, Ihre Buchung wurde erfolgreich storniert.
              </p>

              <!-- Booking Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Buchungsnummer</p>
                    <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#333333;">${bookingReference}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 14px;font-size:15px;color:#333;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum</p>
                    <p style="margin:0 0 14px;font-size:15px;color:#333;">${bookingDate}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Erstattungsbetrag</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#F24444;">${totalAmount.toFixed(2).replace('.', ',')} \u20AC</p>
                  </td>
                </tr>
              </table>

              <!-- Refund Info -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #F24444;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">R\u00FCckerstattung</p>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
                      Die R\u00FCckerstattung von ${totalAmount.toFixed(2).replace('.', ',')} \u20AC erfolgt innerhalb von 5\u201310 Werktagen auf Ihr urspr\u00FCngliches Zahlungsmittel.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Rebook Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                  <td>
                    <a href="${BASE_URL}" style="display:block;background-color:#F24444;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      Neue Tour buchen
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:13px;color:#888;text-align:center;margin:0;">
                Wir w\u00FCrden uns freuen, Sie bald wieder auf Helgoland zu begr\u00FC\u00DFen!
              </p>
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
