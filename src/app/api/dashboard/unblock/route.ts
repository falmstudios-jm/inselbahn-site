import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export const dynamic = 'force-dynamic';

// Delete a blocked/gesperrt booking to free up seats
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { booking_id } = await req.json();
  if (!booking_id) {
    return NextResponse.json({ error: 'booking_id erforderlich' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Verify it's actually a blocked/gesperrt booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('customer_name, total_amount')
    .eq('id', booking_id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: 'Buchung nicht gefunden' }, { status: 404 });
  }

  const isBlocked =
    booking.customer_name === 'BLOCKIERT' ||
    booking.customer_name?.startsWith('GESPERRT');

  if (!isBlocked || Number(booking.total_amount) > 0) {
    return NextResponse.json(
      { error: 'Nur blockierte/gesperrte Buchungen können freigegeben werden' },
      { status: 400 }
    );
  }

  // Delete the blocked booking
  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', booking_id);

  if (deleteError) {
    console.error('Unblock delete error:', deleteError);
    return NextResponse.json({ error: 'Fehler beim Freigeben' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
