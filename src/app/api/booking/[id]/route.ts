import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: booking, error } = await getSupabaseAdmin()
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

  return NextResponse.json({
    id: booking.id,
    booking_reference: booking.booking_reference,
    status: booking.status,
    booking_date: booking.booking_date,
    adults: booking.adults,
    children: booking.children,
    children_free: booking.children_free,
    total_price: booking.total_price,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email,
    tour: booking.departures?.tours,
    departure: {
      id: booking.departures?.id,
      departure_time: booking.departures?.departure_time,
    },
  });
}
