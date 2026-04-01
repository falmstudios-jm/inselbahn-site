import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyPin, createSession, getSession } from '@/lib/dashboard-auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });
    }
    return NextResponse.json({
      name: session.name,
      role: session.role,
      staff_id: session.staff_id,
    });
  } catch {
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { staff_id, pin } = await req.json();

    if (!staff_id || !pin) {
      return NextResponse.json(
        { error: 'Mitarbeiter-ID und PIN erforderlich' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data: staff, error } = await supabase
      .from('staff')
      .select('id, name, pin_hash, role, is_active')
      .eq('id', staff_id)
      .single();

    if (error || !staff) {
      return NextResponse.json(
        { error: 'Mitarbeiter nicht gefunden' },
        { status: 401 }
      );
    }

    if (!staff.is_active) {
      return NextResponse.json(
        { error: 'Konto deaktiviert' },
        { status: 401 }
      );
    }

    if (!staff.pin_hash) {
      return NextResponse.json(
        { error: 'Kein PIN gesetzt. Bitte Administrator kontaktieren.' },
        { status: 401 }
      );
    }

    const pinValid = await verifyPin(staff.pin_hash, pin);
    if (!pinValid) {
      return NextResponse.json(
        { error: 'Falscher PIN' },
        { status: 401 }
      );
    }

    await createSession(staff.id, staff.name, staff.role);

    return NextResponse.json({
      success: true,
      name: staff.name,
      role: staff.role,
    });
  } catch (err) {
    console.error('PIN auth error:', err);
    return NextResponse.json(
      { error: 'Interner Fehler' },
      { status: 500 }
    );
  }
}
