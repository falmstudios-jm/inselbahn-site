import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { z } from 'zod';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

const invoiceRequestSchema = z.object({
  booking_reference: z.string().min(1),
  email: z.string().email(),
  invoice_data: z
    .object({
      company_name: z.string().min(2),
      street: z.string().min(2),
      postal_code: z.string().min(4),
      city: z.string().min(2),
      vat_id: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = invoiceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe' },
        { status: 400 }
      );
    }

    const { booking_reference, email, invoice_data } = parsed.data;
    const supabase = getSupabaseAdmin();

    // Look up booking by reference + email
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, cancel_token, invoice_data, status, customer_email')
      .eq('booking_reference', booking_reference)
      .eq('status', 'confirmed')
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden. Bitte überprüfen Sie Buchungsnummer und E-Mail-Adresse.' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (booking.customer_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden. Bitte überprüfen Sie Buchungsnummer und E-Mail-Adresse.' },
        { status: 404 }
      );
    }

    // If invoice_data is provided, update the booking
    if (invoice_data) {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ invoice_data })
        .eq('id', booking.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Rechnungsdaten konnten nicht gespeichert werden.' },
          { status: 500 }
        );
      }
    } else if (!booking.invoice_data) {
      // No invoice data on file and none provided — ask user to provide it
      return NextResponse.json(
        {
          error: 'Keine Rechnungsdaten vorhanden. Bitte ergänzen Sie Ihre Rechnungsdaten.',
          needs_invoice_data: true,
        },
        { status: 400 }
      );
    }

    // Return the invoice download URL (authenticated via cancel_token)
    const invoiceUrl = `${BASE_URL}/api/booking/${booking.id}/invoice?token=${booking.cancel_token}`;

    return NextResponse.json({ invoice_url: invoiceUrl });
  } catch (err) {
    console.error('Invoice API error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
