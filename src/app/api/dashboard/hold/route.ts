import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { calculateGhostSeats } from '@/lib/ghost-seats';

export const dynamic = 'force-dynamic';

// Create or update a pending hold to reserve seats before payment
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const body = await req.json();
  const { departure_id, booking_date, adults, children, hold_id } = body;

  if (!departure_id || !booking_date) {
    return NextResponse.json({ error: 'Fehlende Daten' }, { status: 400 });
  }

  const total = (adults || 0) + (children || 0);
  const supabase = getSupabaseAdmin();

  // If total is 0, release the hold
  if (total === 0 && hold_id) {
    await supabase.from('bookings').delete().eq('id', hold_id).eq('status', 'pending');
    return NextResponse.json({ success: true, hold_id: null });
  }

  if (total === 0) {
    return NextResponse.json({ success: true, hold_id: null });
  }

  const ghostSeats = calculateGhostSeats();

  // Update existing hold or create new one
  if (hold_id) {
    const { error } = await supabase
      .from('bookings')
      .update({
        adults: adults || 0,
        children: children || 0,
        ghost_seats: ghostSeats,
        total_amount: 0,
      })
      .eq('id', hold_id)
      .eq('status', 'pending');

    if (!error) {
      return NextResponse.json({ success: true, hold_id });
    }
    // If update failed (hold expired), fall through to create new one
  }

  // Create new pending hold
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      departure_id,
      booking_date,
      adults: adults || 0,
      children: children || 0,
      children_free: 0,
      ghost_seats: ghostSeats,
      customer_name: 'HOLD',
      customer_email: 'hold@helgolandbahn.de',
      total_amount: 0,
      status: 'pending',
      payment_method: 'manual_entry',
      created_by: session.staff_id,
      booking_reference: `HOLD-${Date.now()}`,
      cancel_token: `hold-${Date.now()}`,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Hold creation error:', insertError);
    return NextResponse.json({ error: 'Fehler beim Reservieren' }, { status: 500 });
  }

  return NextResponse.json({ success: true, hold_id: booking.id });
}

// Release a hold
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const holdId = searchParams.get('id');
  if (!holdId) return NextResponse.json({ success: true });

  const supabase = getSupabaseAdmin();
  await supabase.from('bookings').delete().eq('id', holdId).eq('status', 'pending');

  return NextResponse.json({ success: true });
}
