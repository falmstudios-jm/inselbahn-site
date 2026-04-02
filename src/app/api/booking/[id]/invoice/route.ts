import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { InvoiceDocument, generateInvoiceNumber } from '@/lib/pdf-invoice';
import type { InvoiceData } from '@/lib/pdf-invoice';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token erforderlich' },
      { status: 401 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch confirmed booking with departure + tour
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, departures:departure_id(*, tours:tour_id(*))')
    .eq('id', id)
    .eq('status', 'confirmed')
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: 'Buchung nicht gefunden' },
      { status: 404 }
    );
  }

  if (booking.cancel_token !== token) {
    return NextResponse.json(
      { error: 'Ungültiger Zugangstoken' },
      { status: 403 }
    );
  }

  // Only serve if invoice_data is present
  if (!booking.invoice_data) {
    return NextResponse.json(
      { error: 'Keine Rechnungsdaten vorhanden' },
      { status: 400 }
    );
  }

  // Assign sequential invoice number if not yet set
  let invoiceNumber = booking.invoice_number;
  if (!invoiceNumber) {
    invoiceNumber = generateInvoiceNumber();
    await supabase
      .from('bookings')
      .update({ invoice_number: invoiceNumber })
      .eq('id', id);
  }

  const tour = booking.departures?.tours;
  const invoiceData: InvoiceData = {
    invoiceNumber,
    invoiceDate: new Date().toISOString().slice(0, 10),
    bookingReference: booking.booking_reference,
    buyerCompanyName: booking.invoice_data.company_name,
    buyerStreet: booking.invoice_data.street,
    buyerPostalCode: booking.invoice_data.postal_code,
    buyerCity: booking.invoice_data.city,
    buyerVatId: booking.invoice_data.vat_id || undefined,
    tourName: tour?.name || 'Inselbahn Tour',
    bookingDate: booking.booking_date,
    departureTime: booking.departures?.departure_time || '',
    adults: booking.adults,
    children: booking.children,
    childrenFree: booking.children_free,
    priceAdult: tour?.price_adult || 0,
    priceChild: tour?.price_child || 0,
    totalAmount: booking.total_amount,
    paidOnline: !!booking.stripe_payment_intent_id,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(InvoiceDocument, { data: invoiceData }) as any
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Rechnung-${invoiceNumber}.pdf"`,
    },
  });
}
