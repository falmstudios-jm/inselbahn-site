import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');
  const search = searchParams.get('search');
  const tourFilter = searchParams.get('tour'); // 'premium', 'unterland', or null/all
  const sortBy = searchParams.get('sort') || 'booking_date'; // 'booking_date' or 'created_at'
  const sortDir = searchParams.get('dir') || 'desc';

  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('bookings')
    .select(`
      id, booking_reference, customer_name, customer_email, customer_phone,
      adults, children, children_free, total_amount, status, payment_method,
      booking_date, created_at, cancelled_at, notes, discount_amount,
      stripe_payment_intent_id, gift_card_id,
      departure:departures (
        id, departure_time,
        tour:tours ( id, slug, name )
      )
    `)
    .in('status', ['confirmed', 'our_cancellation', 'refunded', 'partial_refund']);

  if (dateFrom) query = query.gte('booking_date', dateFrom);
  if (dateTo) query = query.lte('booking_date', dateTo);

  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,booking_reference.ilike.%${search}%`);
  }

  query = query.order(sortBy === 'created_at' ? 'created_at' : 'booking_date', {
    ascending: sortDir === 'asc',
  });

  query = query.limit(200);

  const { data: bookings, error } = await query;

  if (error) {
    console.error('Bookings list error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }

  // Filter by tour slug if needed (can't do nested filter in supabase easily)
  let filtered = bookings || [];
  if (tourFilter && tourFilter !== 'all') {
    filtered = filtered.filter((b) => {
      const dep = b.departure as unknown as { tour: { slug: string } };
      return dep?.tour?.slug?.includes(tourFilter);
    });
  }

  return NextResponse.json({ bookings: filtered });
}
