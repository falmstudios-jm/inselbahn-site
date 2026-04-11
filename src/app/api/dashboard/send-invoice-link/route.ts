import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { booking_reference, email } = await req.json();
    if (!booking_reference || !email) {
      return NextResponse.json({ error: 'Buchungsnummer und E-Mail erforderlich' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Find the booking and update email
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, booking_reference, customer_name, cancel_token, total_amount')
      .eq('booking_reference', booking_reference)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
    }

    // Update the booking with the customer email
    await supabase
      .from('bookings')
      .update({ customer_email: email })
      .eq('id', booking.id);

    // Send email with invoice self-service link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.helgolandbahn.de';
    const invoiceUrl = `${baseUrl}/booking/invoice`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
      to: email,
      subject: `Ihre Buchung ${booking_reference} — Rechnung anfordern`,
      html: `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px;width:100%;">
  <tr><td style="border-top:4px solid #F24444;padding:24px 32px;">
    <h1 style="font-size:18px;color:#333;margin:0 0 20px;">INSELBAHN HELGOLAND</h1>
    <p style="color:#555;font-size:15px;line-height:1.6;">Hallo${booking.customer_name && booking.customer_name !== 'Barzahlung' ? ` ${booking.customer_name}` : ''},</p>
    <p style="color:#555;font-size:15px;line-height:1.6;">vielen Dank für Ihre Buchung! Hier können Sie Ihre Rechnung anfordern:</p>
    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#888;">Buchungsnummer</p>
      <p style="margin:0;font-size:24px;font-weight:bold;color:#333;letter-spacing:2px;">${booking_reference}</p>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;">Auf der folgenden Seite können Sie Ihre Rechnungsdaten eingeben und die Rechnung als PDF herunterladen:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${invoiceUrl}" style="display:inline-block;background:#F24444;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">Rechnung anfordern</a>
    </div>
    <p style="color:#888;font-size:12px;line-height:1.5;">Sie benötigen Ihre Buchungsnummer <strong>${booking_reference}</strong> und diese E-Mail-Adresse, um die Rechnung abzurufen.</p>
    <p style="color:#888;font-size:11px;margin-top:16px;">Alle Preise sind Endpreise. Gemäß §1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).</p>
  </td></tr>
  <tr><td style="background:#f8f9fa;padding:16px 32px;text-align:center;border-top:1px solid #e0e0e0;">
    <p style="margin:0;font-size:12px;color:#888;">Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Send invoice link error:', err);
    return NextResponse.json({ error: 'Fehler beim Senden' }, { status: 500 });
  }
}
