import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const FEE_PER_BOOKING = 0.80;
const RECIPIENT_EMAIL = 'j.martens@falmstudios.com';
const SENDER_EMAIL = 'Inselbahn Helgoland <buchung@helgolandbahn.de>';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if today is the last day of the month
    const now = new Date();
    const berlinNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const tomorrow = new Date(berlinNow);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.getDate() !== 1) {
      // Not the last day of the month — skip
      return NextResponse.json({ skipped: true, reason: 'Not last day of month' });
    }

    const year = berlinNow.getFullYear();
    const month = berlinNow.getMonth(); // 0-indexed
    const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(berlinNow.getDate()).padStart(2, '0')}`;
    const monthName = berlinNow.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

    const supabase = getSupabaseAdmin();

    // Count confirmed ONLINE bookings for this month
    const { count, error } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .eq('payment_method', 'online')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`);

    if (error) {
      console.error('Fee calculation error:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    const bookingCount = count || 0;
    const totalFee = bookingCount * FEE_PER_BOOKING;
    const totalFeeFormatted = totalFee.toFixed(2).replace('.', ',');

    if (bookingCount === 0) {
      return NextResponse.json({ skipped: true, reason: 'No online bookings this month' });
    }

    // Send fee summary email
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT_EMAIL,
      subject: `falmstudios Gebühr ${monthName} — ${totalFeeFormatted} €`,
      html: `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px;width:100%;">
  <tr><td style="border-top:4px solid #333;padding:32px;">
    <h1 style="font-size:20px;color:#333;margin:0 0 24px;">Monatliche Abrechnung — falmstudios GmbH</h1>

    <div style="background:#f9f9f9;border-radius:8px;padding:20px;margin-bottom:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#555;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;"><strong>Zeitraum</strong></td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${monthName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">Online-Buchungen</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${bookingCount}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">Gebühr pro Buchung</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">0,80 €</td>
        </tr>
        <tr>
          <td style="padding:12px 0;"><strong style="font-size:16px;color:#333;">Gesamtbetrag</strong></td>
          <td style="padding:12px 0;text-align:right;"><strong style="font-size:20px;color:#333;">${totalFeeFormatted} €</strong></td>
        </tr>
      </table>
    </div>

    <p style="font-size:13px;color:#888;line-height:1.6;">
      Diese Abrechnung wird automatisch am letzten Tag jedes Monats erstellt.
      Zahlung fällig innerhalb von 14 Tagen.
    </p>
    <p style="font-size:13px;color:#888;">
      Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
    });

    return NextResponse.json({
      success: true,
      month: monthName,
      bookings: bookingCount,
      fee: totalFee,
    });
  } catch (err) {
    console.error('falmstudios fee error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
