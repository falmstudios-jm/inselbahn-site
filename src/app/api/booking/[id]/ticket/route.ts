import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { TicketDocument } from '@/lib/pdf-ticket';
import type { TicketData } from '@/lib/pdf-ticket';

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

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

  const ticketData: TicketData = {
    bookingReference: booking.booking_reference,
    customerName: booking.customer_name || '',
    tourName: booking.departures?.tours?.name || 'Inselbahn Tour',
    bookingDate: booking.booking_date,
    departureTime: booking.departures?.departure_time || '',
    adults: booking.adults,
    children: booking.children,
    childrenFree: booking.children_free,
    totalAmount: booking.total_amount,
    cancelUrl: `${BASE_URL}/booking/cancel?id=${booking.id}&token=${booking.cancel_token}`,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(TicketDocument, { data: ticketData }) as any
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Fahrkarte-${booking.booking_reference}.pdf"`,
    },
  });
}
