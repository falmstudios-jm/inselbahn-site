import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Sends post-tour feedback emails for all confirmed bookings that happened today.
 * Triggered by Vercel Cron daily at 18:00 UTC (= 20:00 Berlin summer time).
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

    // Find confirmed bookings for today that haven't received feedback email
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, departures:departure_id(*, tours:tour_id(*))')
      .eq('status', 'confirmed')
      .eq('booking_date', berlinDate)
      .eq('feedback_sent', false);

    if (error) {
      console.error('Post-tour feedback query error:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const resend = getResend();
    let sentCount = 0;

    for (const booking of bookings) {
      const tourName = booking.departures?.tours?.name || 'Inselbahn Tour';

      try {
        await resend.emails.send({
          from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
          to: booking.customer_email,
          subject: 'Wie war Ihre Tour? \uD83C\uDF0A',
          html: buildFeedbackEmail({
            customerName: booking.customer_name,
            tourName,
          }),
        });

        await supabase
          .from('bookings')
          .update({ feedback_sent: true })
          .eq('id', booking.id);

        sentCount++;
      } catch (emailErr) {
        console.error(
          `Failed to send feedback email for booking ${booking.id}:`,
          emailErr
        );
      }
    }

    if (sentCount > 0) {
      console.log(`Post-tour feedback: sent ${sentCount} of ${bookings.length}`);
    }

    return NextResponse.json({ sent: sentCount, total: bookings.length });
  } catch (err) {
    console.error('Post-tour feedback cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

interface FeedbackEmailParams {
  customerName: string;
  tourName: string;
}

function buildFeedbackEmail(params: FeedbackEmailParams): string {
  const { customerName, tourName } = params;

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

          <!-- Body -->
          <tr>
            <td style="padding:0 24px 32px;">
              <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
                Hallo ${customerName}, vielen Dank, dass Sie heute mit uns die ${tourName} gemacht haben! Wir hoffen, es hat Ihnen gefallen.
              </p>

              <!-- Google Rating -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#333;">\u2B50 Hat es Ihnen gefallen?</p>
                    <p style="margin:0 0 16px;font-size:13px;color:#555;">Eine Google-Bewertung hilft anderen Besuchern, uns zu finden \u2014 und uns, noch besser zu werden.</p>
                    <a href="https://g.page/r/CeEvXFmlaLMwEBE/review" style="display:inline-block;background-color:#F24444;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:6px;">
                      Jetzt bewerten
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Helgoland Tips -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:4px solid #F24444;padding-left:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#333;">Unsere Helgoland-Tipps f\u00FCr Sie</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5;">\uD83C\uDF66 Bestes Eis: Gelateria Curniciello am Fahrstuhl</p>
                    <p style="margin:0 0 8px;font-size:13px;color:#555;line-height:1.5;">\uD83C\uDF7D\uFE0F Restaurant-Tipp: Fragen Sie die Einheimischen \u2014 die besten Empfehlungen wechseln mit der Saison!</p>
                    <p style="margin:0;font-size:13px;color:#555;line-height:1.5;">\uD83D\uDEB6 Zu Fu\u00DF zur Langen Anna: Vom Fahrstuhl aus ca. 20 Min. \u00FCber den Klippenrandweg</p>
                  </td>
                </tr>
              </table>

              <!-- Feedback -->
              <p style="font-size:13px;color:#888;line-height:1.5;margin:0;">
                Anregungen oder Kritik? Schreiben Sie uns gerne an <a href="mailto:info@helgolandbahn.de" style="color:#F24444;text-decoration:none;">info@helgolandbahn.de</a> \u2014 wir freuen uns \u00FCber Ihr Feedback!
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
                Inselbahn Helgoland \u2014 Gef\u00FChrte Inselrundfahrten auf Deutschlands einziger Hochseeinsel
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
