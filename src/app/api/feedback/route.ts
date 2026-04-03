import { NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * QStash callback endpoint for sending post-tour feedback emails.
 * Called by QStash when the scheduled timer fires after a tour ends.
 */
export async function POST(req: Request) {
  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  const signature = req.headers.get('upstash-signature');
  const body = await req.text();

  // Verify QStash signature
  try {
    const isValid = await receiver.verify({ signature: signature!, body });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  } catch {
    console.error('QStash signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { booking_id } = JSON.parse(body) as { booking_id: string };

  if (!booking_id) {
    return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, departures:departure_id(*, tours:tour_id(*))')
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking) {
      console.error('Feedback: booking not found', fetchError);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'confirmed' || booking.feedback_sent) {
      return NextResponse.json({ skipped: true });
    }

    const tourName = booking.departures?.tours?.name || 'Inselbahn Tour';
    const year = new Date().getFullYear();
    const refSuffix = booking.booking_reference?.replace('IB-2026-', '') || 'XXXX';
    const discountCode = `DANKE-${year}-${refSuffix}`;
    const validUntil = `${year + 1}-12-31T23:59:59+01:00`;

    await supabase
      .from('discount_codes')
      .upsert({
        code: discountCode,
        type: 'percentage',
        value: 10,
        description: `10% Rabatt f\u00FCr ${booking.customer_name}`,
        max_uses: 1,
        current_uses: 0,
        valid_from: new Date().toISOString(),
        valid_until: validUntil,
        is_active: true,
      }, { onConflict: 'code' });

    await getResend().emails.send({
      from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
      to: booking.customer_email,
      subject: `Sch\u00F6n, dass Sie dabei waren! \uD83C\uDF0A Ihr pers\u00F6nlicher Rabattcode`,
      html: buildFeedbackEmail({
        customerName: booking.customer_name,
        tourName,
        discountCode,
        validUntil: `31.12.${year + 1}`,
      }),
    });

    await supabase
      .from('bookings')
      .update({ feedback_sent: true })
      .eq('id', booking.id);

    console.log(`Feedback email sent for booking ${booking_id}`);
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error(`Failed to send feedback email for booking ${booking_id}:`, err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

interface FeedbackEmailParams {
  customerName: string;
  tourName: string;
  discountCode: string;
  validUntil: string;
}

function buildFeedbackEmail(params: FeedbackEmailParams): string {
  const { customerName, tourName, discountCode, validUntil } = params;
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://inselbahnhelgoland.vercel.app';

  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F7F7F7;font-family:'Montserrat',Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

<!-- Red top border -->
<tr><td style="background-color:#F24444;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Header -->
<tr><td style="padding:28px 24px 8px;text-align:center;">
<h1 style="color:#333;margin:0;font-size:22px;font-weight:700;letter-spacing:2px;">INSELBAHN HELGOLAND</h1>
</td></tr>

<!-- Hero image placeholder -->
<tr><td style="padding:8px 24px 0;">
<img src="${BASE}/images/topdown.jpg" alt="Helgoland von oben" width="552" style="width:100%;border-radius:8px;display:block;" />
</td></tr>

<!-- Body -->
<tr><td style="padding:20px 24px 32px;">

<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
Hallo ${customerName}, vielen Dank, dass Sie mit uns die <strong>${tourName}</strong> gemacht haben! Wir hoffen, Sie hatten eine wunderbare Zeit auf Helgoland.
</p>

<!-- DISCOUNT CODE — first and prominent -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0FFF0;border:2px dashed #4B8B3B;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:24px;text-align:center;">
<p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px;">Ihr pers\u00F6nlicher Rabattcode</p>
<p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#333;">10% Rabatt auf Ihre n\u00E4chste Buchung!</p>
<p style="margin:0 0 12px;font-size:28px;font-weight:700;color:#4B8B3B;font-family:monospace;letter-spacing:2px;">${discountCode}</p>
<p style="margin:0 0 4px;font-size:13px;color:#555;">G\u00FCltig bis ${validUntil} \u00B7 Einmalig einl\u00F6sbar</p>
<p style="margin:0;font-size:14px;font-weight:600;color:#4B8B3B;">Teilen Sie diesen Code gerne mit Freunden & Familie!</p>
</td></tr>
</table>

<!-- Google Rating -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F7F7;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
<p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#333;">Hat es Ihnen gefallen?</p>
<p style="margin:0 0 14px;font-size:13px;color:#555;">Eine Google-Bewertung hilft anderen Besuchern, uns zu finden.</p>
<a href="https://www.google.com/maps/place/Inselbahn+Rundfahrten+Helgoland/@54.1810127,7.8906696,17z" style="display:inline-block;background-color:#F24444;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:6px;">Jetzt bewerten</a>
</td></tr>
</table>

<!-- Recommendations -->
<p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#333;">Unsere pers\u00F6nlichen Empfehlungen</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
<tr>
<td width="50%" style="padding:0 6px 12px 0;vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F0;border-radius:8px;overflow:hidden;">
<tr><td><img src="${BASE}/images/premium-20250814_123019.jpg" alt="Gelateria" width="276" style="width:100%;height:120px;object-fit:cover;display:block;" /></td></tr>
<tr><td style="padding:12px 14px 14px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">Gelateria Curniciello</p>
<p style="margin:0;font-size:12px;color:#555;line-height:1.4;">Unsere pers\u00F6nliche Empfehlung: Das beste Eis der Insel \u2014 direkt am Fahrstuhl. Die freundlichsten Menschen gibt es gratis dazu!</p>
</td></tr>
</table>
</td>
<td width="50%" style="padding:0 0 12px 6px;vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F0;border-radius:8px;overflow:hidden;">
<tr><td><img src="${BASE}/images/premium-20250807_151052.jpg" alt="Aquarium Restaurant" width="276" style="width:100%;height:120px;object-fit:cover;display:block;" /></td></tr>
<tr><td style="padding:12px 14px 14px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">Aquarium Restaurant</p>
<p style="margin:0;font-size:12px;color:#555;line-height:1.4;">Edles Restaurant mit frischem Fisch und Steak, extrem beliebt! Unbedingt rechtzeitig reservieren.</p>
</td></tr>
</table>
</td>
</tr>
<tr>
<td width="50%" style="padding:0 6px 0 0;vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F8FF;border-radius:8px;overflow:hidden;">
<tr><td><img src="${BASE}/images/premium-20250814_150116.jpg" alt="fink App" width="276" style="width:100%;height:120px;object-fit:cover;display:block;" /></td></tr>
<tr><td style="padding:12px 14px 14px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">fink \u2014 Die Vogel-App</p>
<p style="margin:0 0 8px;font-size:12px;color:#555;line-height:1.4;">Das Helgol\u00E4nder Start-Up entwickelt eine innovative Birdwatching-App f\u00FCr Helgoland und ganz Europa.</p>
<a href="https://finkapp.eu" style="color:#F24444;font-size:12px;font-weight:600;text-decoration:none;">finkapp.eu &rarr;</a>
</td></tr>
</table>
</td>
<td width="50%" style="padding:0 0 0 6px;vertical-align:top;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0FF;border-radius:8px;overflow:hidden;">
<tr><td><img src="${BASE}/images/premium-20250814_123029.jpg" alt="Halunder.ai" width="276" style="width:100%;height:120px;object-fit:cover;display:block;" /></td></tr>
<tr><td style="padding:12px 14px 14px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#333;">Halunder.ai</p>
<p style="margin:0 0 8px;font-size:12px;color:#555;line-height:1.4;">Europas kleinste Sprache hat den kleinsten \u00DCbersetzer der Welt \u2014 entwickelt von einem Helgol\u00E4nder.</p>
<a href="https://halunder.ai" style="color:#F24444;font-size:12px;font-weight:600;text-decoration:none;">halunder.ai &rarr;</a>
</td></tr>
</table>
</td>
</tr>
</table>

<!-- Feedback -->
<p style="font-size:13px;color:#888;line-height:1.5;margin:16px 0 0;">
Anregungen oder Kritik? Schreiben Sie uns an <a href="mailto:info@helgolandbahn.de" style="color:#F24444;text-decoration:none;">info@helgolandbahn.de</a> \u2014 wir freuen uns \u00FCber Ihr Feedback!
</p>

</td></tr>

<!-- Footer -->
<tr><td style="background-color:#F7F7F7;padding:20px;text-align:center;border-top:1px solid #E0E0E0;">
<p style="margin:0 0 4px;font-size:11px;color:#888;">Helgol\u00E4nder Dienstleistungs GmbH \u00B7 Von-Aschen-Str. 594 \u00B7 27498 Helgoland</p>
<a href="mailto:info@helgolandbahn.de" style="font-size:11px;color:#F24444;text-decoration:none;">info@helgolandbahn.de</a>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}
