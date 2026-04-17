import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';

export const dynamic = 'force-dynamic';

// Mark a departure as cancelled for a specific date (Tour fällt aus)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { departure_id, booking_date, reason } = await req.json();
  if (!departure_id || !booking_date) {
    return NextResponse.json({ error: 'departure_id und booking_date erforderlich' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Use a cancellation record rather than modifying the departure template
  // (departures are a recurring schedule, not per-date instances)
  const { error } = await supabase
    .from('departure_cancellations')
    .upsert(
      {
        departure_id,
        cancelled_date: booking_date,
        cancelled_at: new Date().toISOString(),
        cancelled_by: session.staff_id,
        reason: reason || 'Tour fällt aus',
      },
      { onConflict: 'departure_id,cancelled_date' }
    );

  if (error) {
    console.error('Cancel departure error:', error);
    return NextResponse.json({ error: 'Fehler beim Absagen' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Undo a cancellation
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const departureId = searchParams.get('departure_id');
  const bookingDate = searchParams.get('booking_date');

  if (!departureId || !bookingDate) {
    return NextResponse.json({ error: 'departure_id und booking_date erforderlich' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('departure_cancellations')
    .delete()
    .eq('departure_id', departureId)
    .eq('cancelled_date', bookingDate);

  if (error) {
    console.error('Uncancel error:', error);
    return NextResponse.json({ error: 'Fehler beim Rückgängigmachen' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
