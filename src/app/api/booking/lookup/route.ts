import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { booking_reference, email } = body;

    if (!booking_reference || !email) {
      return NextResponse.json(
        { error: 'Buchungsnummer und E-Mail-Adresse sind erforderlich.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, cancel_token, status, customer_email, booking_reference')
      .eq('booking_reference', booking_reference.toUpperCase())
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden. Bitte überprüfen Sie Ihre Eingaben.' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (booking.customer_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Buchung nicht gefunden. Bitte überprüfen Sie Ihre Eingaben.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: booking.id,
      cancel_token: booking.cancel_token,
    });
  } catch {
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten.' },
      { status: 500 }
    );
  }
}
