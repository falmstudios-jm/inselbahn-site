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

    if (mode === 'block') {
      return handleBlockSale(body, session);
    }

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
    customer_email,
    custom_total,
  } = body as {
    departure_id?: string;
    booking_date?: string;
    adults?: number;
    children?: number;
    children_free?: number;
    payment_method?: string;
    customer_name?: string;
    customer_email?: string;
    custom_total?: number;
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
    .in('status', ['confirmed', 'partial_refund']);

  const usedSeats = (existingBookings || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
    return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
  }, 0);

  const groupSize = (adults as number) + (children as number) + (children_free as number);
  const remaining = capacity - usedSeats;

  // Passengers must fit in physical capacity
  if (groupSize > remaining) {
    return NextResponse.json(
      {
        error: 'Nicht genügend Plätze verfügbar',
        available: Math.max(0, remaining),
      },
      { status: 409 }
    );
  }

  const computedTotal = calculateTotal(
    adults as number,
    children as number,
    tour.price_adult,
    tour.price_child
  );
  // Allow seller to override the total (e.g. group discount); must be >= 0
  const totalAmount =
    typeof custom_total === 'number' && custom_total >= 0 && !Number.isNaN(custom_total)
      ? Math.round(custom_total * 100) / 100
      : computedTotal;

  const bookingReference = generateBookingReference();

  // Re-check capacity right before insert to prevent race conditions
  const { data: recheck } = await supabase
    .from('bookings')
    .select('adults, children, children_free, ghost_seats')
    .eq('departure_id', departure_id)
    .eq('booking_date', booking_date)
    .in('status', ['confirmed', 'partial_refund']);

  const recheckSeats = (recheck || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
    return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
  }, 0);

  const recheckRemaining = capacity - recheckSeats;
  if (groupSize > recheckRemaining) {
    return NextResponse.json(
      {
        error: 'Nicht genügend Plätze verfügbar (Kapazität hat sich geändert)',
        available: Math.max(0, recheckRemaining),
      },
      { status: 409 }
    );
  }

  // Ghost seats: 1 per booking, reduced if near physical capacity
  const ghostSeats = Math.min(calculateGhostSeats(), Math.max(0, recheckRemaining - groupSize));

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
      customer_email: customer_email?.trim() || 'walkin@helgolandbahn.de',
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
    .in('status', ['confirmed', 'partial_refund']);

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

async function handleBlockSale(
  body: Record<string, unknown>,
  session: { staff_id: string; name: string; role: string }
) {
  const {
    departure_id,
    booking_date,
    adults = 1,
    notes = 'Reserviert',
  } = body as {
    departure_id?: string;
    booking_date?: string;
    adults?: number;
    notes?: string;
  };

  if (!departure_id || !booking_date) {
    return NextResponse.json(
      { error: 'Abfahrt und Datum erforderlich' },
      { status: 400 }
    );
  }

  const seatsToBlock = adults as number;
  if (seatsToBlock <= 0) {
    return NextResponse.json(
      { error: 'Mindestens ein Platz erforderlich' },
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
    .in('status', ['confirmed', 'partial_refund']);

  const usedSeats = (existingBookings || []).reduce((sum: number, b: { adults: number; children: number; children_free: number; ghost_seats: number | null }) => {
    return sum + b.adults + b.children + (b.children_free || 0) + (b.ghost_seats || 0);
  }, 0);

  if (seatsToBlock > capacity - usedSeats) {
    return NextResponse.json(
      {
        error: 'Nicht genügend Plätze verfügbar',
        available: Math.max(0, capacity - usedSeats),
      },
      { status: 409 }
    );
  }

  const bookingReference = generateBookingReference();

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      departure_id,
      booking_date,
      adults: seatsToBlock,
      children: 0,
      children_free: 0,
      ghost_seats: 0,
      customer_name: 'BLOCKIERT',
      customer_email: 'block@helgolandbahn.de',
      total_amount: 0,
      booking_reference: bookingReference,
      status: 'confirmed',
      payment_method: 'manual_entry',
      created_by: session.staff_id,
      notes: notes || 'Reserviert',
    })
    .select()
    .single();

  if (insertError || !booking) {
    console.error('Block insert error:', insertError);
    return NextResponse.json(
      { error: 'Blockierung konnte nicht erstellt werden' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    booking_id: booking.id,
    booking_reference: bookingReference,
    total_amount: 0,
  });
}
