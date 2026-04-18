import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { getStripe } from '@/lib/stripe';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.helgolandbahn.de';

// Create a manual invoice (Sonderfahrt etc.) and email the customer a link
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, amount, description, payment_status } = body as {
      email?: string;
      amount?: number;
      description?: string;
      payment_status?: 'paid' | 'stripe' | 'transfer';
    };

    if (!email || !amount || amount <= 0 || !description) {
      return NextResponse.json(
        { error: 'E-Mail, Betrag und Beschreibung erforderlich' },
        { status: 400 }
      );
    }
    const status = payment_status || 'transfer';

    const supabase = getSupabaseAdmin();
    const accessToken = randomBytes(16).toString('hex');

    // Generate invoice reference (similar to booking reference but with INV prefix)
    const year = new Date().getFullYear();
    const refRand = randomBytes(2).toString('hex').toUpperCase();
    const reference = `INV-${year}-${refRand}`;

    // Create Stripe payment link if requested
    let stripeUrl: string | null = null;
    let stripePaymentIntentId: string | null = null;
    if (status === 'stripe') {
      try {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          payment_method_types: ['card', 'sepa_debit', 'paypal'],
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: { name: description },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ],
          customer_email: email,
          success_url: `${BASE_URL}/manual-invoice/${accessToken}?paid=1`,
          cancel_url: `${BASE_URL}/manual-invoice/${accessToken}`,
          metadata: {
            type: 'manual_invoice',
            reference,
          },
        });
        stripeUrl = session.url;
        stripePaymentIntentId = session.payment_intent ? String(session.payment_intent) : null;
      } catch (e) {
        console.error('Stripe payment link failed:', e);
        return NextResponse.json(
          { error: 'Stripe-Zahlungslink konnte nicht erstellt werden' },
          { status: 500 }
        );
      }
    }

    const { data: invoice, error: insertError } = await supabase
      .from('manual_invoices')
      .insert({
        reference,
        access_token: accessToken,
        customer_email: email,
        amount,
        description,
        payment_status: status,
        stripe_url: stripeUrl,
        stripe_payment_intent_id: stripePaymentIntentId,
        created_by: session.staff_id,
      })
      .select('id')
      .single();

    if (insertError || !invoice) {
      console.error('Manual invoice insert error:', insertError);
      return NextResponse.json({ error: 'Fehler beim Anlegen' }, { status: 500 });
    }

    // Send the customer an email
    const customerLink = `${BASE_URL}/manual-invoice/${accessToken}`;
    const formattedAmount = Number(amount).toFixed(2).replace('.', ',');
    let paymentBlock = '';
    if (status === 'paid') {
      paymentBlock = `<div style="background:#E8F5E9;border:1px solid #4B8B3B;border-radius:8px;padding:14px;margin:16px 0;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#2E7D32;">✓ Bereits bezahlt</p>
      </div>`;
    } else if (status === 'stripe' && stripeUrl) {
      paymentBlock = `<div style="background:#fff;border:2px solid #F24444;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#333;">${formattedAmount} € online bezahlen</p>
        <a href="${stripeUrl}" style="display:inline-block;background:#F24444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:700;font-size:14px;">Jetzt online bezahlen</a>
      </div>`;
    } else {
      paymentBlock = `<div style="background:#FFF8E1;border:1px solid #F5B100;border-radius:8px;padding:14px;margin:16px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#333;">Bitte überweisen Sie ${formattedAmount} € an:</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.5;">
          <strong>Helgoländer Dienstleistungs GmbH</strong><br/>
          IBAN: DE94 2175 0000 0190 1018 87<br/>
          BIC: NOLADE21NOS<br/>
          Verwendungszweck: <strong>${reference}</strong>
        </p>
      </div>`;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
      to: email,
      subject: `Rechnung ${reference} — ${formattedAmount} € — Inselbahn Helgoland`,
      html: `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px;width:100%;">
<tr><td style="border-top:4px solid #F24444;padding:28px 32px;">
<h1 style="font-size:18px;color:#333;margin:0 0 20px;letter-spacing:2px;">INSELBAHN HELGOLAND</h1>
<p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Hallo,</p>
<p style="color:#555;font-size:15px;line-height:1.6;">vielen Dank! Unten finden Sie die Details und einen Link, über den Sie Ihre Rechnungsdaten ergänzen und die Rechnung als PDF herunterladen können.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;margin:20px 0;">
<tr><td style="padding:16px;">
<p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Beschreibung</p>
<p style="margin:0 0 14px;font-size:14px;color:#333;">${description}</p>
<p style="margin:0 0 6px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Betrag</p>
<p style="margin:0 0 14px;font-size:24px;font-weight:700;color:#333;">${formattedAmount} €</p>
<p style="margin:0 0 4px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Referenz</p>
<p style="margin:0;font-size:14px;font-weight:700;color:#333;font-family:monospace;letter-spacing:1px;">${reference}</p>
</td></tr></table>
${paymentBlock}
<div style="text-align:center;margin:24px 0;">
<a href="${customerLink}" style="display:inline-block;background:#333;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;">Rechnung & Daten verwalten</a>
</div>
<p style="color:#888;font-size:11px;line-height:1.5;margin-top:16px;">Helgoland: Gemäß §1 Abs. 2 UStG wird keine Umsatzsteuer erhoben. Alle Preise sind Endpreise.</p>
</td></tr>
<tr><td style="background:#f8f9fa;padding:16px 32px;text-align:center;border-top:1px solid #e0e0e0;">
<p style="margin:0;font-size:11px;color:#888;">Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
    });

    return NextResponse.json({
      success: true,
      reference,
      access_token: accessToken,
      customer_link: customerLink,
    });
  } catch (err) {
    console.error('Manual invoice error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

// List manual invoices
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('manual_invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }
  return NextResponse.json({ invoices: data || [] });
}

// Update payment status (e.g. mark Überweisung as paid)
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { id, payment_status } = await req.json();
  if (!id || !payment_status || !['paid', 'stripe', 'transfer'].includes(payment_status)) {
    return NextResponse.json({ error: 'id und gültiger payment_status erforderlich' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('manual_invoices')
    .update({ payment_status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
