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

    // Check cancellation deadline: booking_date - 1 day at midnight Berlin time
    const bookingDate = new Date(booking.booking_date + 'T00:00:00');
    // Deadline is midnight of the day before, in Berlin timezone
    const deadlineUtc = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);
    // Convert current time to Berlin
    const nowBerlin = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })
    );
    // Deadline in Berlin: midnight the day before booking
    const deadlineBerlin = new Date(
      deadlineUtc.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })
    );

    if (nowBerlin >= deadlineBerlin) {
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
              <h2 style="color:#c0392b;margin:0 0 8px;font-size:20px;">Ihre Buchung wurde storniert</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, Ihre Buchung wurde erfolgreich storniert.
              </p>

              <!-- Booking Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Buchungsnummer</p>
                    <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#1a3a5c;">${bookingReference}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${bookingDate}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Erstattungsbetrag</p>
                    <p style="margin:0;font-size:18px;font-weight:700;color:#c0392b;">${totalAmount.toFixed(2).replace('.', ',')} \u20AC</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #c0392b;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">Erstattung</p>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.5;">
                      Der Betrag von ${totalAmount.toFixed(2).replace('.', ',')} \u20AC wird in den n\u00E4chsten 5\u201310 Werktagen auf Ihr urspr\u00FCngliches Zahlungsmittel erstattet.
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
