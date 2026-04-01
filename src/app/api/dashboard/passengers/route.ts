import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const departureId = searchParams.get('departure_id');
  const date = searchParams.get('date');

  if (!departureId || !date) {
    return NextResponse.json(
      { error: 'departure_id und date erforderlich' },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: passengers, error } = await supabase
      .from('bookings')
      .select('id, customer_name, adults, children, children_free, payment_method, booking_reference, status')
      .eq('departure_id', departureId)
      .eq('booking_date', date)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Passengers error:', error);
      return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
    }

    return NextResponse.json({ passengers: passengers || [] });
  } catch (err) {
    console.error('Dashboard passengers error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}
