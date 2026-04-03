import { getSupabaseAdmin } from './supabase-admin';
import { getStripe } from './stripe';
import { Resend } from 'resend';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://helgolandbahn.de';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

// ── Helper: resolve tour slug to tour row ──

async function getTourBySlug(slug: string) {
  const supabase = getSupabaseAdmin();
  // Try exact match first
  const { data } = await supabase.from('tours').select('*').eq('slug', slug).single();
  if (data) return data;
  // Try with -tour suffix
  const { data: d2 } = await supabase.from('tours').select('*').eq('slug', `${slug}-tour`).single();
  if (d2) return d2;
  // Try without -tour suffix
  const bare = slug.replace(/-tour$/, '');
  const { data: d3 } = await supabase.from('tours').select('*').eq('slug', bare).single();
  if (d3) return d3;
  // Try by name (case-insensitive via ilike)
  const { data: d4 } = await supabase.from('tours').select('*').ilike('name', `%${slug}%`).single();
  if (d4) return d4;
  throw new Error(`Tour "${slug}" nicht gefunden`);
}

// ── Tool: update_tour_price ──

export async function update_tour_price(args: {
  tour_slug: string;
  price_adult?: number;
  price_child?: number;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const tour = await getTourBySlug(args.tour_slug);

  const updates: Record<string, number> = {};
  if (args.price_adult !== undefined) updates.price_adult = args.price_adult;
  if (args.price_child !== undefined) updates.price_child = args.price_child;

  if (Object.keys(updates).length === 0) {
    return `Keine Preisänderung angegeben für ${tour.name}.`;
  }

  const { error } = await supabase
    .from('tours')
    .update(updates)
    .eq('id', tour.id);

  if (error) throw new Error(`Fehler beim Aktualisieren: ${error.message}`);

  const parts: string[] = [];
  if (args.price_adult !== undefined)
    parts.push(`Erwachsenenpreis: ${tour.price_adult}€ → ${args.price_adult}€`);
  if (args.price_child !== undefined)
    parts.push(`Kinderpreis: ${tour.price_child}€ → ${args.price_child}€`);

  return `Preise für ${tour.name} aktualisiert: ${parts.join(', ')}.`;
}

// ── Tool: cancel_departures ──

export async function cancel_departures(args: {
  tour_slug?: string;
  date: string;
  time?: string; // Optional: specific departure time like "16:00"
  reason?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const resend = getResend();

  // Build query for confirmed bookings on this date
  let query = supabase
    .from('bookings')
    .select('*, departures:departure_id(*, tours:tour_id(*))')
    .eq('booking_date', args.date)
    .eq('status', 'confirmed');

  // If a specific tour is given, filter by tour slug
  if (args.tour_slug) {
    const tour = await getTourBySlug(args.tour_slug);
    let depQuery = supabase
      .from('departures')
      .select('id')
      .eq('tour_id', tour.id);
    // If a specific time is given, filter to that departure only
    if (args.time) {
      const timeStr = args.time.length === 5 ? args.time + ':00' : args.time;
      depQuery = depQuery.eq('departure_time', timeStr);
    }
    const { data: departures } = await depQuery;
    const depIds = (departures || []).map((d: { id: string }) => d.id);
    if (depIds.length === 0) {
      return `Keine Abfahrt gefunden für ${args.tour_slug}${args.time ? ` um ${args.time}` : ''}.`;
    }
    query = query.in('departure_id', depIds);
  }

  const { data: bookings, error } = await query;
  if (error) throw new Error(`Fehler beim Laden der Buchungen: ${error.message}`);

  if (!bookings || bookings.length === 0) {
    return `Keine bestätigten Buchungen für ${args.date}${args.tour_slug ? ` (${args.tour_slug})` : ''} gefunden.`;
  }

  const stripe = getStripe();
  let refundedCount = 0;
  let refundedAmount = 0;
  let emailsSent = 0;

  let giftCardsRestored = 0;

  for (const booking of bookings) {
    // Issue Stripe refund if payment exists
    if (booking.stripe_payment_intent_id) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        });
        refundedAmount += Number(booking.total_amount);
      } catch (e) {
        console.error(`Refund failed for ${booking.booking_reference}:`, e);
      }
    }

    // Restore gift card balance if booking used a gift card
    if (booking.gift_card_id) {
      try {
        const { data: usages } = await supabase
          .from('gift_card_usage')
          .select('id, amount_used, gift_card_id')
          .eq('booking_id', booking.id);

        for (const usage of usages || []) {
          // Add back the used amount to the gift card
          const { data: card } = await supabase
            .from('gift_cards')
            .select('remaining_value')
            .eq('id', usage.gift_card_id)
            .single();

          if (card) {
            await supabase
              .from('gift_cards')
              .update({ remaining_value: Number(card.remaining_value) + Number(usage.amount_used) })
              .eq('id', usage.gift_card_id);
          }
        }
        giftCardsRestored++;
      } catch (e) {
        console.error(`Gift card restore failed for ${booking.booking_reference}:`, e);
      }
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: 'our_cancellation',
        notes: args.reason || 'Stornierung durch Betreiber',
      })
      .eq('id', booking.id);

    refundedCount++;

    // Send cancellation email
    const tour = booking.departures?.tours;
    try {
      await resend.emails.send({
        from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
        to: booking.customer_email,
        subject: `Stornierung Ihrer Buchung ${booking.booking_reference} — Inselbahn Helgoland`,
        html: `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px;width:100%;">
        <tr><td style="background:#1a3a5c;padding:32px 24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Inselbahn Helgoland</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="color:#c0392b;margin:0 0 16px;">Tour leider abgesagt</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Hallo ${booking.customer_name},<br><br>
            leider müssen wir Ihre Buchung <strong>${booking.booking_reference}</strong>
            für die <strong>${tour?.name || 'Tour'}</strong> am
            <strong>${new Date(args.date + 'T00:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            absagen.
            ${args.reason ? `<br><br><strong>Grund:</strong> ${args.reason}` : ''}
            <br><br>
            ${booking.stripe_payment_intent_id ? 'Der gezahlte Betrag wird Ihnen in den nächsten 5–10 Werktagen erstattet.' : ''}
          </p>
          <p style="color:#555;font-size:14px;line-height:1.6;">
            Wir entschuldigen uns für die Unannehmlichkeiten und hoffen, Sie bald auf Helgoland begrüßen zu dürfen!
          </p>
        </td></tr>
        <tr><td style="background:#f8f9fa;padding:24px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;font-size:13px;color:#888;">
            Fragen? <a href="mailto:info@helgolandbahn.de" style="color:#1a3a5c;">info@helgolandbahn.de</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      });
      emailsSent++;
    } catch (e) {
      console.error(`Email failed for ${booking.booking_reference}:`, e);
    }
  }

  return `${refundedCount} Buchung(en) für ${args.date} storniert. ${refundedAmount.toFixed(2)}€ erstattet. ${emailsSent} Stornierungsmail(s) gesendet.${giftCardsRestored > 0 ? ` ${giftCardsRestored} Gutschein(e) wiederhergestellt.` : ''}`;
}

// ── Tool: create_announcement ──

export async function create_announcement(args: {
  message: string;
  type: 'info' | 'warning' | 'cancellation';
  affected_date?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('announcements').insert({
    message: args.message,
    type: args.type,
    affected_date: args.affected_date || null,
    is_active: true,
  });

  if (error) throw new Error(`Fehler beim Erstellen: ${error.message}`);

  return `Ankündigung erstellt: "${args.message}" (Typ: ${args.type})${args.affected_date ? `, betrifft ${args.affected_date}` : ''}.`;
}

// ── Tool: add_departure ──

export async function add_departure(args: {
  tour_slug: string;
  time: string;
  bookable_online?: boolean;
  notes?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const tour = await getTourBySlug(args.tour_slug);

  const { error } = await supabase.from('departures').insert({
    tour_id: tour.id,
    departure_time: args.time + ':00',
    is_active: true,
    bookable_online: args.bookable_online !== false,
    notes: args.notes || null,
  });

  if (error) throw new Error(`Fehler beim Hinzufügen: ${error.message}`);

  return `Neue Abfahrt um ${args.time} Uhr für ${tour.name} hinzugefügt.`;
}

// ── Tool: remove_departure ──

export async function remove_departure(args: {
  tour_slug: string;
  time: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const tour = await getTourBySlug(args.tour_slug);

  const timeFormatted = args.time.length === 5 ? args.time + ':00' : args.time;

  const { data, error } = await supabase
    .from('departures')
    .update({ is_active: false })
    .eq('tour_id', tour.id)
    .eq('departure_time', timeFormatted)
    .eq('is_active', true)
    .select();

  if (error) throw new Error(`Fehler beim Entfernen: ${error.message}`);

  if (!data || data.length === 0) {
    return `Keine aktive Abfahrt um ${args.time} Uhr für ${tour.name} gefunden.`;
  }

  return `Abfahrt um ${args.time} Uhr für ${tour.name} deaktiviert.`;
}

// ── Tool: update_capacity ──

export async function update_capacity(args: {
  tour_slug: string;
  max_capacity: number;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const tour = await getTourBySlug(args.tour_slug);

  const oldCapacity = tour.max_capacity;

  const { error } = await supabase
    .from('tours')
    .update({ max_capacity: args.max_capacity })
    .eq('id', tour.id);

  if (error) throw new Error(`Fehler beim Aktualisieren: ${error.message}`);

  return `Kapazität für ${tour.name} geändert: ${oldCapacity} → ${args.max_capacity} Personen.`;
}

// ── Tool: get_revenue ──

export async function get_revenue(args: {
  start_date: string;
  end_date: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('total_amount, status, departure_id, departures:departure_id(tours:tour_id(name, slug))')
    .gte('booking_date', args.start_date)
    .lte('booking_date', args.end_date)
    .in('status', ['confirmed', 'partial_refund']);

  if (error) throw new Error(`Fehler beim Laden: ${error.message}`);

  if (!bookings || bookings.length === 0) {
    return `Keine bestätigten Buchungen im Zeitraum ${args.start_date} bis ${args.end_date}.`;
  }

  const total = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const byTour: Record<string, number> = {};

  for (const b of bookings) {
    const tourName = (b.departures as unknown as { tours: { name: string } })?.tours?.name || 'Unbekannt';
    byTour[tourName] = (byTour[tourName] || 0) + Number(b.total_amount);
  }

  const breakdown = Object.entries(byTour)
    .map(([name, amount]) => `  ${name}: ${amount.toFixed(2)}€`)
    .join('\n');

  return `Umsatz ${args.start_date} bis ${args.end_date}:\nGesamt: ${total.toFixed(2)}€ (${bookings.length} Buchungen)\n${breakdown}`;
}

// ── Tool: get_bookings ──

export async function get_bookings(args: {
  date: string;
  tour_slug?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from('bookings')
    .select('*, departures:departure_id(departure_time, tours:tour_id(name, slug))')
    .eq('booking_date', args.date)
    .in('status', ['confirmed', 'pending']);

  if (args.tour_slug) {
    const tour = await getTourBySlug(args.tour_slug);
    const { data: departures } = await supabase
      .from('departures')
      .select('id')
      .eq('tour_id', tour.id);
    const depIds = (departures || []).map((d: { id: string }) => d.id);
    if (depIds.length > 0) {
      query = query.in('departure_id', depIds);
    }
  }

  const { data: bookings, error } = await query;
  if (error) throw new Error(`Fehler beim Laden: ${error.message}`);

  if (!bookings || bookings.length === 0) {
    return `Keine Buchungen für ${args.date}${args.tour_slug ? ` (${args.tour_slug})` : ''} gefunden.`;
  }

  const totalPassengers = bookings.reduce(
    (sum, b) => sum + b.adults + b.children + (b.children_free || 0),
    0
  );
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);

  const lines = bookings.map((b) => {
    const dep = b.departures as unknown as { departure_time: string; tours: { name: string } };
    const time = dep?.departure_time?.slice(0, 5) || '??:??';
    const tour = dep?.tours?.name || 'Unbekannt';
    return `  ${time} | ${tour} | ${b.booking_reference} | ${b.customer_name} | ${b.adults}E+${b.children}K | ${Number(b.total_amount).toFixed(2)}€ | ${b.status}`;
  });

  return `Buchungen am ${args.date}: ${bookings.length} Buchungen, ${totalPassengers} Fahrgäste, ${totalRevenue.toFixed(2)}€\n${lines.join('\n')}`;
}

// ── Tool: create_discount_code ──

export async function create_discount_code(args: {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_uses?: number;
  valid_until?: string;
  description?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('discount_codes').insert({
    code: args.code.toUpperCase(),
    type: args.type,
    value: args.value,
    max_uses: args.max_uses || null,
    valid_until: args.valid_until || null,
    description: args.description || null,
    is_active: true,
  });

  if (error) throw new Error(`Fehler beim Erstellen: ${error.message}`);

  const valueStr = args.type === 'percentage' ? `${args.value}%` : `${args.value}€`;
  return `Rabattcode "${args.code.toUpperCase()}" erstellt: ${valueStr} Rabatt${args.max_uses ? `, max. ${args.max_uses} Nutzungen` : ''}${args.valid_until ? `, gültig bis ${args.valid_until}` : ''}.`;
}

// ── Tool: partial_refund ──

export async function partial_refund(args: {
  booking_reference: string;
  amount: number;
  reason?: string;
}): Promise<string> {
  const supabase = getSupabaseAdmin();
  const stripe = getStripe();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_reference', args.booking_reference)
    .single();

  if (error || !booking) {
    throw new Error(`Buchung "${args.booking_reference}" nicht gefunden.`);
  }

  if (!booking.stripe_payment_intent_id) {
    throw new Error(`Buchung ${args.booking_reference} hat keine Stripe-Zahlung — Teilerstattung nicht möglich.`);
  }

  await stripe.refunds.create({
    payment_intent: booking.stripe_payment_intent_id,
    amount: Math.round(args.amount * 100),
  });

  await supabase
    .from('bookings')
    .update({
      status: 'partial_refund',
      notes: args.reason || `Teilerstattung: ${args.amount}€`,
    })
    .eq('id', booking.id);

  return `Teilerstattung von ${args.amount.toFixed(2)}€ für Buchung ${args.booking_reference} (${booking.customer_name}) durchgeführt.`;
}

// ── Tool: cancel_booking (single booking) ──

export async function cancel_booking(args: {
  booking_reference: string;
  reason?: string;
  partial_amount?: number;
}) {
  const supabase = getSupabaseAdmin();

  // Find the booking
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, departures(departure_time, tours(name))')
    .eq('booking_reference', args.booking_reference)
    .single();

  if (error || !booking) throw new Error(`Buchung "${args.booking_reference}" nicht gefunden`);
  if (booking.status === 'refunded' || booking.status === 'cancelled') {
    return `Buchung ${args.booking_reference} ist bereits storniert/erstattet.`;
  }

  const isPartial = args.partial_amount && args.partial_amount < Number(booking.total_amount);
  const refundAmount = args.partial_amount ?? Number(booking.total_amount);
  const reason = args.reason || 'Storniert über Ops-Agent';

  // Handle Stripe refund
  if (booking.stripe_payment_intent_id) {
    try {
      const stripe = getStripe();
      await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        amount: Math.round(refundAmount * 100),
      });
    } catch (stripeErr) {
      throw new Error(`Stripe-Erstattung fehlgeschlagen: ${stripeErr instanceof Error ? stripeErr.message : String(stripeErr)}`);
    }
  }

  // Restore gift card if used
  if (booking.gift_card_id) {
    try {
      const { data: usage } = await supabase
        .from('gift_card_usage')
        .select('amount_used')
        .eq('booking_id', booking.id)
        .eq('gift_card_id', booking.gift_card_id)
        .single();
      if (usage) {
        const restoreAmount = isPartial ? Math.min(refundAmount, Number(usage.amount_used)) : Number(usage.amount_used);
        const { data: card } = await supabase
          .from('gift_cards')
          .select('remaining_value')
          .eq('id', booking.gift_card_id)
          .single();
        if (card) {
          await supabase
            .from('gift_cards')
            .update({ remaining_value: Number(card.remaining_value) + restoreAmount })
            .eq('id', booking.gift_card_id);
        }
      }
    } catch (gcErr) {
      console.error('Gift card restore error:', gcErr);
    }
  }

  // Update booking status
  const newStatus = isPartial ? 'partial_refund' : (booking.stripe_payment_intent_id ? 'refunded' : 'cancelled');
  await supabase
    .from('bookings')
    .update({
      status: newStatus,
      cancelled_at: new Date().toISOString(),
      notes: `${booking.notes ? booking.notes + ' | ' : ''}${reason}`,
    })
    .eq('id', booking.id);

  // Send cancellation email
  try {
    const resend = getResend();
    const tourName = (booking.departures as { tours: { name: string } })?.tours?.name || 'Tour';
    const depTime = (booking.departures as { departure_time: string })?.departure_time?.slice(0, 5) || '';
    const formattedDate = new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('de-DE', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

    await resend.emails.send({
      from: 'Inselbahn Helgoland <buchung@helgolandbahn.de>',
      to: booking.customer_email,
      subject: `Stornierung ${args.booking_reference} — ${tourName}`,
      html: `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
        <div style="border-top:4px solid #F24444;padding:24px 0;">
          <h1 style="font-size:20px;margin:0 0 4px;">INSELBAHN HELGOLAND</h1>
          <div style="background:#FFF0F0;border-radius:8px;padding:16px;margin:20px 0;text-align:center;">
            <p style="font-size:18px;font-weight:700;color:#dc2626;margin:0;">Buchung storniert</p>
          </div>
          <p>Hallo ${booking.customer_name},</p>
          <p>Ihre Buchung <strong>${args.booking_reference}</strong> wurde storniert.</p>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>Tour:</strong> ${tourName}</p>
            <p style="margin:4px 0;"><strong>Datum:</strong> ${formattedDate}, ${depTime} Uhr</p>
            <p style="margin:4px 0;"><strong>Grund:</strong> ${reason}</p>
          </div>
          ${booking.stripe_payment_intent_id ? `
            <div style="border-left:4px solid #F24444;padding-left:16px;margin:16px 0;">
              <p><strong>Erstattung:</strong> ${refundAmount.toFixed(2).replace('.', ',')} €</p>
              <p style="font-size:13px;color:#666;">Die Rückerstattung erfolgt innerhalb von 5–10 Werktagen auf Ihr Zahlungsmittel.</p>
            </div>
          ` : booking.gift_card_id ? `
            <div style="border-left:4px solid #F24444;padding-left:16px;margin:16px 0;">
              <p>Der Gutscheinbetrag wurde zurück auf Ihren Gutschein gebucht.</p>
            </div>
          ` : ''}
          <p>Möchten Sie eine neue Tour buchen?</p>
          <a href="${BASE_URL}" style="display:inline-block;background:#F24444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0;">Neue Tour buchen</a>
          <p style="font-size:11px;color:#999;margin-top:24px;">Helgoländer Dienstleistungs GmbH · Von-Aschen-Str. 594 · 27498 Helgoland</p>
        </div>
      </body></html>`,
    });
  } catch (emailErr) {
    console.error('Cancellation email error:', emailErr);
  }

  const amountStr = refundAmount.toFixed(2).replace('.', ',');
  return `Buchung ${args.booking_reference} (${booking.customer_name}) ${isPartial ? 'teilweise' : 'vollständig'} storniert. ${booking.stripe_payment_intent_id ? `${amountStr} € erstattet.` : booking.gift_card_id ? 'Gutscheinbetrag zurückgebucht.' : 'Keine Online-Zahlung, Erstattung vor Ort.'} Storno-E-Mail an ${booking.customer_email} gesendet.`;
}

// ── Tool dispatcher ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TOOL_MAP: Record<string, (args: any) => Promise<string>> = {
  update_tour_price,
  cancel_departures,
  cancel_booking,
  create_announcement,
  add_departure,
  remove_departure,
  update_capacity,
  get_revenue,
  get_bookings,
  create_discount_code,
  partial_refund,
};

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const fn = TOOL_MAP[name];
  if (!fn) return `Unbekanntes Tool: ${name}`;
  try {
    return await fn(args);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Fehler: ${msg}`;
  }
}
