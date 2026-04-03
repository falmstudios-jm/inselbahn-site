import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/dashboard-auth';
import { calculateTotal, generateBookingReference } from '@/lib/booking-utils';
import { calculateGhostSeats } from '@/lib/ghost-seats';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const mode = body.mode || 'individual';

    if (mode === 'bulk') {
      return handleBulkSale(body, session);
    }

    return handleIndividualSale(body, session);
  } catch (err) {
    console.error('Dashboard sell error:', err);
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
  }
}

async function handleIndividualSale(
  body: Record<string, unknown>,
  session: { staff_id: string; name: string; role: string }
) {
  const {
    departure_id,
    booking_date,
    adults = 0,
    children = 0,
    children_free = 0,
    payment_method,
    customer_name,
  } = body as {
    departure_id?: string;
    booking_date?: string;
    adults?: number;
    children?: number;
    children_free?: number;
    payment_method?: string;
    customer_name?: string;
  };

  if (!departure_id || !booking_date || !payment_method) {
    return NextResponse.json(
      { error: 'Pflichtfelder fehlen' },
      { status: 400 }
    );
  }

  if (adults === 0 && children === 0 && children_free === 0) {
    return NextResponse.json(
      { error: 'Mindestens eine Person erforderlich' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch departure + tour
  const { data: departure, error: depError } = await supabase
    .from('departures')
    .select('*, tours(*)')
    .eq('id', departure_id)
    .single();

  if (depError || !departure) {
    return NextResponse.json(
      { error: 'Abfahrt nicht gefunden' },
      { status: 400 }
    );
  }

  const tour = departure.tours;
  const capacity: number = tour.max_capacity;

  // Check availability
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('adults, children, children_free, ghost_seats')
    .eq('departure_id', departure_id)
    .eq('booking_date', booking_date)
    .eq('status', 'confirmed');

  const usedSeats = (existingBookings || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
    return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
  }, 0);

  const groupSize = (adults as number) + (children as number) + (children_free as number);
  const ghostSeats = calculateGhostSeats(groupSize);
  const seatsNeeded = groupSize + ghostSeats;

  if (seatsNeeded > capacity - usedSeats) {
    return NextResponse.json(
      {
        error: 'Nicht genügend Plätze verfügbar',
        available: Math.max(0, capacity - usedSeats),
      },
      { status: 409 }
    );
  }

  const totalAmount = calculateTotal(
    adults as number,
    children as number,
    tour.price_adult,
    tour.price_child
  );

  const bookingReference = generateBookingReference();

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      departure_id,
      booking_date,
      adults,
      children,
      children_free,
      ghost_seats: ghostSeats,
      customer_name: customer_name || (payment_method === 'cash' ? 'Barzahlung' : 'SumUp-Zahlung'),
      customer_email: 'walkin@helgolandbahn.de',
      total_amount: totalAmount,
      booking_reference: bookingReference,
      status: 'confirmed',
      payment_method,
      created_by: session.staff_id,
    })
    .select()
    .single();

  if (insertError || !booking) {
    console.error('Sell insert error:', insertError);
    return NextResponse.json(
      { error: 'Buchung konnte nicht erstellt werden' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    booking_id: booking.id,
    booking_reference: bookingReference,
    total_amount: totalAmount,
  });
}

async function handleBulkSale(
  body: Record<string, unknown>,
  session: { staff_id: string; name: string; role: string }
) {
  const {
    departure_id,
    booking_date,
    adults = 0,
    children = 0,
    bar_amount = 0,
    card_amount = 0,
    note = '',
  } = body as {
    departure_id?: string;
    booking_date?: string;
    adults?: number;
    children?: number;
    bar_amount?: number;
    card_amount?: number;
    note?: string;
  };

  if (!departure_id || !booking_date) {
    return NextResponse.json(
      { error: 'Abfahrt und Datum erforderlich' },
      { status: 400 }
    );
  }

  if ((adults as number) === 0 && (children as number) === 0) {
    return NextResponse.json(
      { error: 'Mindestens eine Person erforderlich' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Fetch departure + tour for capacity check
  const { data: departure, error: depError } = await supabase
    .from('departures')
    .select('*, tours(*)')
    .eq('id', departure_id)
    .single();

  if (depError || !departure) {
    return NextResponse.json(
      { error: 'Abfahrt nicht gefunden' },
      { status: 400 }
    );
  }

  const tour = departure.tours;
  const capacity: number = tour.max_capacity;

  // Check availability
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('adults, children, children_free, ghost_seats')
    .eq('departure_id', departure_id)
    .eq('booking_date', booking_date)
    .eq('status', 'confirmed');

  const usedSeats = (existingBookings || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
    return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
  }, 0);

  const groupSize = (adults as number) + (children as number);

  if (groupSize > capacity - usedSeats) {
    return NextResponse.json(
      {
        error: 'Nicht genügend Plätze verfügbar',
        available: Math.max(0, capacity - usedSeats),
      },
      { status: 409 }
    );
  }

  const totalAmount = (bar_amount as number) + (card_amount as number);
  const bookingReference = generateBookingReference();

  const notesText = [
    `Manuell nachgetragen von ${session.name}`,
    note ? note : null,
    (bar_amount as number) > 0 ? `Bar: ${(bar_amount as number).toFixed(2)}€` : null,
    (card_amount as number) > 0 ? `Karte: ${(card_amount as number).toFixed(2)}€` : null,
  ].filter(Boolean).join(' | ');

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      departure_id,
      booking_date,
      adults,
      children,
      children_free: 0,
      ghost_seats: 0,
      customer_name: `Sammelverkauf ${session.name}`,
      customer_email: 'walkin@helgolandbahn.de',
      total_amount: totalAmount,
      booking_reference: bookingReference,
      status: 'confirmed',
      payment_method: 'manual_entry',
      created_by: session.staff_id,
      notes: notesText,
    })
    .select()
    .single();

  if (insertError || !booking) {
    console.error('Bulk sell insert error:', insertError);
    return NextResponse.json(
      { error: 'Eintrag konnte nicht erstellt werden' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    booking_id: booking.id,
    booking_reference: bookingReference,
    total_amount: totalAmount,
  });
}
