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

          <!-- Friendly Banner -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#4B8B3B;border-radius:8px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">Heute geht\u2019s los! \uD83C\uDF89</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Hallo ${customerName}, wir freuen uns auf Sie! Hier die wichtigsten Infos:
              </p>

              <!-- Tour Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Tour</p>
                    <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#333333;">${tourName}</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Datum &amp; Uhrzeit</p>
                    <p style="margin:0 0 14px;font-size:15px;color:#333;">${formattedDate}, ${formattedTime} Uhr</p>

                    <p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Treffpunkt</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#333;">Franz-Schensky-Platz, Helgoland</p>
                  </td>
                </tr>
              </table>

              <!-- Meeting Point with walking times -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #F24444;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#333;">Bitte um ${subtractMinutes(formattedTime, 15)} Uhr am Treffpunkt sein</p>
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                      Vom Anleger der Halunder Jet / Katamarane: ca. 5 Min. Fu\u00DFweg<br>
                      Von der Landungsbr\u00FCcke (B\u00F6rteboot): ca. 3 Min. Fu\u00DFweg
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Weather Tip -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.6;">
                      <strong>\uD83C\uDF24\uFE0F Wetter-Tipp:</strong> Auf Helgoland kann es windig sein \u2014 bringen Sie eine leichte Jacke mit, auch bei Sonnenschein! Bei Regen fahren wir trotzdem (unsere Wagen sind \u00FCberdacht).
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ticket Download -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td>
                    <a href="${ticketUrl}" style="display:block;background-color:#F24444;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:6px;text-align:center;">
                      Fahrkarte herunterladen (PDF)
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px;color:#333;text-align:center;font-weight:700;margin:0;">
                Wir freuen uns auf Sie! \uD83D\uDE80
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F7F7;padding:24px;text-align:center;border-top:1px solid #E0E0E0;">
              <p style="margin:0 0 6px;font-size:12px;color:#888;">
                Helgol\u00E4nder Dienstleistungs GmbH \u00B7 Am Falm 302 A \u00B7 27498 Helgoland
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

function subtractMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m - minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}
