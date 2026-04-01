import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends reminder emails for all confirmed bookings happening today.
 * Triggered by Vercel Cron daily at 5 AM UTC (= 7 AM Berlin summer time).
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Get today's date in Europe/Berlin timezone
    const berlinDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Europe/Berlin',
    }); // Returns "YYYY-MM-DD"

    // Find confirmed bookings for today that haven't been reminded
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, departures:departure_id(*, tours:tour_id(*))')
      .eq('status', 'confirmed')
      .eq('booking_date', berlinDate)
      .eq('reminder_sent', false);

    if (error) {
      console.error('Reminder query error:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const resend = getResend();
    let sentCount = 0;

    for (const booking of bookings) {
      const tour = booking.departures?.tours;
      const departureTime = booking.departures?.departure_time || '';
      const formattedTime = departureTime.slice(0, 5);
      const tourName = tour?.name || 'Inselbahn Tour';

      const ticketUrl = `${BASE_URL}/api/booking/${booking.id}/ticket?token=${booking.cancel_token}`;

      const formattedDate = new Date(
        booking.booking_date + 'T00:00:00'
      ).toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      try {
        await resend.emails.send({
          from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
          to: booking.customer_email,
          subject: `Heute geht's los! Ihre Inselbahn-Tour um ${formattedTime} Uhr`,
          html: buildReminderEmail({
            customerName: booking.customer_name,
            tourName,
            formattedDate,
            formattedTime,
            ticketUrl,
          }),
        });

        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', booking.id);

        sentCount++;
      } catch (emailErr) {
        console.error(
          `Failed to send reminder for booking ${booking.id}:`,
          emailErr
        );
      }
    }

    if (sentCount > 0) {
      console.log(`Reminders: sent ${sentCount} of ${bookings.length}`);
    }

    return NextResponse.json({ sent: sentCount, total: bookings.length });
  } catch (err) {
    console.error('Reminder cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

interface ReminderEmailParams {
  customerName: string;
  tourName: string;
  formattedDate: string;
  formattedTime: string;
  ticketUrl: string;
}

function buildReminderEmail(params: ReminderEmailParams): string {
  const { customerName, tourName, formattedDate, formattedTime, ticketUrl } =
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
              <p style="color:#a3c4e0;margin:8px 0 0;font-size:14px;">Erinnerung an Ihre heutige Tour</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 24px;">
              <h2 style="color:#1a3a5c;margin:0 0 8px;font-size:20px;">Heute geht\u2019s los! \u{1F680}</h2>
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, wir freuen uns auf Sie! Hier noch einmal die wichtigsten Infos zu Ihrer heutigen Tour:
              </p>

              <!-- Tour Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#1a3a5c;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum &amp; Uhrzeit</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#333;">${formattedDate}, ${formattedTime} Uhr</p>

                    <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Treffpunkt</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#333;">Franz-Schensky-Platz, Helgoland</p>
                  </td>
                </tr>
              </table>

              <!-- Meeting Point Reminder -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #e8a838;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#555;line-height:1.5;">
                      Bitte seien Sie <strong>15 Minuten vor Abfahrt</strong> (also um <strong>${subtractMinutes(formattedTime, 15)} Uhr</strong>) am Treffpunkt.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Weather Tip -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef6ff;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0;font-size:14px;color:#1a3a5c;line-height:1.5;">
                      <strong>Wetter-Tipp:</strong> Auf Helgoland kann es windig sein \u2014 bringen Sie am besten eine leichte Jacke mit, auch bei Sonnenschein!
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ticket Download -->
              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 12px;">
                Ihre Fahrkarte können Sie hier herunterladen:
              </p>
              <a href="${ticketUrl}" style="display:inline-block;background-color:#1a3a5c;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                Fahrkarte herunterladen (PDF)
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="margin:0 0 4px;font-size:13px;color:#888;">
                Wir wünschen Ihnen eine wunderbare Fahrt!
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

function subtractMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m - minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
