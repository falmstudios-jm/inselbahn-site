import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get('token');

  const supabase = getSupabaseAdmin();

  if (token) {
    // Token-based access for cancel page — return booking details if token matches
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, departures:departure_id(*, tours:tour_id(*))')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden' },
        { status: 404 }
      );
    }

    if (booking.cancel_token !== token) {
      return NextResponse.json(
        { error: 'Ungültiger Stornierungslink' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: booking.id,
      booking_reference: booking.booking_reference,
      status: booking.status,
      booking_date: booking.booking_date,
      adults: booking.adults,
      children: booking.children,
      children_free: booking.children_free,
      total_amount: booking.total_amount,
      customer_name: booking.customer_name,
      customer_email: booking.customer_email,
      tour: booking.departures?.tours,
      departure: {
        id: booking.departures?.id,
        departure_time: booking.departures?.departure_time,
      },
    });
  }

  // Standard access — only return confirmed bookings
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, departures:departure_id(*, tours:tour_id(*))')
    .eq('id', id)
    .in('status', ['confirmed', 'partial_refund'])
    .single();

  if (error || !booking) {
    return NextResponse.json(
      { error: 'Buchung nicht gefunden' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id: booking.id,
    booking_reference: booking.booking_reference,
    status: booking.status,
    booking_date: booking.booking_date,
    adults: booking.adults,
    children: booking.children,
    children_free: booking.children_free,
    total_amount: booking.total_amount,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    tour: booking.departures?.tours,
    departure: {
      id: booking.departures?.id,
      departure_time: booking.departures?.departure_time,
    },
  });
}
