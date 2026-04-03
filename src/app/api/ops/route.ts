import { NextResponse } from 'next/server';
import { getSession } from '@/lib/dashboard-auth';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { executeTool } from '@/lib/ops-tools';

const TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'update_tour_price',
      description: 'Update the price of a tour',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          price_adult: { type: 'number' },
          price_child: { type: 'number' },
        },
        required: ['tour_slug'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancel_departures',
      description:
        'Cancel bookings for a tour on a specific date. Can cancel ALL departures of a tour on that date, or a SINGLE departure if time is specified. Issues refunds and sends cancellation emails.',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          date: { type: 'string', description: 'YYYY-MM-DD format' },
          time: { type: 'string', description: 'Optional: specific departure time in HH:MM format (e.g. 16:00). If omitted, ALL departures of the tour on that date are cancelled.' },
          reason: { type: 'string' },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'cancel_booking',
      description: 'Cancel a single booking by its booking reference (e.g. IB-2026-XXXX). Issues refund and sends cancellation email. NO password required for individual bookings.',
      parameters: {
        type: 'object',
        properties: {
          booking_reference: { type: 'string', description: 'e.g. IB-2026-XXXX' },
          reason: { type: 'string', description: 'Reason for cancellation' },
          partial_amount: { type: 'number', description: 'If partial refund, the amount in EUR. Omit for full refund.' },
        },
        required: ['booking_reference'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_announcement',
      description: 'Create a banner announcement on the website',
      parameters: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          type: { type: 'string', enum: ['info', 'warning', 'cancellation'] },
          affected_date: {
            type: 'string',
            description: 'YYYY-MM-DD if applicable',
          },
          active_from: {
            type: 'string',
            description: 'ISO date-time when announcement starts showing. Default: now.',
          },
          active_until: {
            type: 'string',
            description: 'ISO date-time when announcement stops showing. E.g. end of day: 2026-04-04T23:59:59',
          },
        },
        required: ['message', 'type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_departure',
      description: 'Add a new departure time for a tour',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          time: { type: 'string', description: 'HH:MM format' },
          bookable_online: { type: 'boolean', default: true },
          notes: { type: 'string' },
        },
        required: ['tour_slug', 'time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'remove_departure',
      description: 'Remove/deactivate a departure time',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          time: { type: 'string', description: 'HH:MM format' },
        },
        required: ['tour_slug', 'time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_capacity',
      description: 'Update the maximum capacity of a tour',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          max_capacity: { type: 'number' },
        },
        required: ['tour_slug', 'max_capacity'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_revenue',
      description: 'Get revenue statistics for a date range',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string' },
          end_date: { type: 'string' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_bookings',
      description: 'Get bookings for a specific date',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
        },
        required: ['date'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_discount_code',
      description: 'Create a new discount code',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          type: { type: 'string', enum: ['percentage', 'fixed'] },
          value: { type: 'number' },
          max_uses: { type: 'number' },
          valid_until: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['code', 'type', 'value'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'partial_refund',
      description: 'Issue a partial refund for a booking. Server-side validated: amount cannot exceed booking total.',
      parameters: {
        type: 'object',
        properties: {
          booking_reference: { type: 'string' },
          amount: { type: 'number', description: 'Amount in EUR to refund. Must be <= booking total.' },
          reason: { type: 'string' },
        },
        required: ['booking_reference', 'amount'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_tour_details',
      description: 'Get current tour details including prices, capacity, and departure times. Call without tour_slug to get all tours.',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'], description: 'Optional: specific tour. Omit for all tours.' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_departure',
      description: 'Update properties of an existing departure (e.g. bookable_online, notes)',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          time: { type: 'string', description: 'HH:MM format' },
          bookable_online: { type: 'boolean' },
          notes: { type: 'string' },
        },
        required: ['tour_slug', 'time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_discount_codes',
      description: 'List all discount codes with usage stats and status',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_bookings',
      description: 'Search bookings by customer name, email, status, or date range. Use this to find specific customers or view cancellation history.',
      parameters: {
        type: 'object',
        properties: {
          customer_name: { type: 'string', description: 'Partial name match (case-insensitive)' },
          customer_email: { type: 'string', description: 'Partial email match' },
          status: { type: 'string', enum: ['confirmed', 'pending', 'cancelled', 'refunded', 'our_cancellation', 'partial_refund', 'nopayment'] },
          start_date: { type: 'string', description: 'YYYY-MM-DD' },
          end_date: { type: 'string', description: 'YYYY-MM-DD' },
        },
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_cancellation_stats',
      description: 'Get cancellation/refund statistics for a date range. Shows counts and amounts by cancellation type.',
      parameters: {
        type: 'object',
        properties: {
          start_date: { type: 'string', description: 'YYYY-MM-DD' },
          end_date: { type: 'string', description: 'YYYY-MM-DD' },
        },
        required: ['start_date', 'end_date'],
      },
    },
  },
];

const SYSTEM_PROMPT = `Du bist der Operations-Assistent der Inselbahn Helgoland. Du hilfst dem Admin-Team, die Inselbahn zu verwalten.

DEIN VERHALTEN:
- Sei SMART und frage IMMER nach, wenn wichtige Details fehlen! Führe niemals blind einen Befehl aus.
- Bei Rabattcodes: Frage nach max. Nutzungen, Gültigkeitsdatum, Beschreibung, Prozent oder Festbetrag
- Bei Preisänderungen: Frage nach ob Kinderpreis auch geändert werden soll
- Bei Ankündigungen: Frage nach Typ (info/warning/cancellation) und bis wann die Ankündigung gelten soll
- Bei Stornierungsankündigungen (cancellation): Setze active_until automatisch auf Ende des betroffenen Tages (z.B. "2026-04-04T23:59:59")
- Bei allgemeinen Info-Ankündigungen: Frage den Nutzer, wie lange die Ankündigung sichtbar sein soll, und setze active_until entsprechend
- Bei neuen Abfahrten: Frage ob online buchbar
- Generell: Wenn der Nutzer etwas unklar formuliert, frage ZUERST nach bevor du handelst!

EINZELBUCHUNG STORNIEREN (cancel_booking):
- KEIN Passwort nötig! Einzelbuchungen können direkt storniert werden.
- ABER: Frage IMMER ZUERST nach:
  1. "Was ist der Grund für die Stornierung?" (z.B. Kundenwunsch, Wetter, zu groß für Fahrzeug, etc.)
  2. "Soll die gesamte Buchung erstattet werden, oder nur ein Teilbetrag?"
- ERST wenn du Grund UND Erstattungsart hast → cancel_booking aufrufen
- Den Grund dann als reason-Parameter übergeben — NICHT "Storniert über Ops-Agent" oder "Auf Kundenwunsch"!
- Volle Erstattung ist der Standard. Nur bei explizitem Wunsch Teilerstattung.
- Umbuchung ist NICHT möglich. Der Gast muss stornieren und neu buchen.

SICHERHEIT — GEFÄHRLICHE AKTIONEN:
Die folgenden Aktionen sind GEFÄHRLICH und erfordern das Sicherheitspasswort:
- cancel_departures (MASSEN-Stornierung + Rückerstattungen für ALLE Buchungen eines Tages)
- Preisänderungen über 20% Abweichung vom aktuellen Preis (wird auch serverseitig geprüft!)
- Löschung von Abfahrten (remove_departure)
NICHT gefährlich (kein Passwort nötig): cancel_booking (einzelne Buchung), partial_refund (einzelne Teilerstattung), get_revenue, get_bookings, get_tour_details, get_discount_codes, search_bookings, get_cancellation_stats, create_announcement, create_discount_code, add_departure, update_departure, update_capacity

Wenn eine gefährliche Aktion angefragt wird:
1. Erkläre was du tun wirst und welche Auswirkungen es hat (z.B. "X Buchungen werden storniert, Y € werden erstattet")
2. Frage: "Dies ist eine kritische Aktion. Bitte bestätigen Sie mit dem Sicherheitspasswort."
3. Der Nutzer muss das Passwort "GER12234+GER12956!" eingeben
4. ERST DANN ausführen
5. Wenn das Passwort falsch ist: "Falsches Sicherheitspasswort. Aktion abgebrochen."

Du hast Zugriff auf folgende Funktionen:
- Tourpreise ändern (update_tour_price) — >20% Änderung wird serverseitig blockiert
- Tourdetails & Preise anzeigen (get_tour_details)
- Buchungen stornieren und erstatten (cancel_departures) ⚠️ GEFÄHRLICH
- Einzelbuchung stornieren (cancel_booking)
- Website-Ankündigungen erstellen (create_announcement)
- Abfahrtszeiten hinzufügen (add_departure), ändern (update_departure) oder entfernen (remove_departure) ⚠️ GEFÄHRLICH
- Kapazität ändern (update_capacity)
- Umsatz abfragen (get_revenue)
- Buchungen anzeigen (get_bookings)
- Buchungen suchen nach Name/E-Mail/Status (search_bookings)
- Stornierungsstatistiken (get_cancellation_stats)
- Rabattcodes erstellen (create_discount_code) — max. 50% Rabatt, serverseitig geprüft
- Rabattcodes anzeigen (get_discount_codes)
- Teilerstattungen (partial_refund) — Betrag darf Buchungssumme nicht übersteigen

WICHTIG: Bei Fragen zu aktuellen Preisen IMMER get_tour_details aufrufen, NICHT aus dem Gedächtnis antworten!

UNSERE TOUREN (aktuell in der Datenbank):
- Tour-Slug "unterland" = Unterland-Tour (~45 Min, max. 42 Pers. + 1 Rollstuhl, 1 Fahrzeug)
  Abfahrten: 12:15 (ab Schiff, nicht online buchbar), 13:30, 14:30
- Tour-Slug "premium" = Premium-Tour (~90 Min, max. 18 Pers., 2 Fahrzeuge)
  Abfahrten: 10:00, 12:15 (ab Schiff, nicht online buchbar), 14:00, 16:00
- Saison: April bis Oktober
- Alle Preise sind Endpreise, keine MwSt (Helgoland §1 Abs. 2 UStG)
- Kinder unter 6: kostenlos. Kinder 6-14: Kinderpreis. Ab 15: Erwachsenenpreis.
- Bei der Unterland-Tour um 14:30 fahren alle Kinder kostenlos!

BUCHUNGS-STATI in der Datenbank:
- pending: Zahlung läuft (15 Min Timeout)
- confirmed: Bezahlt und bestätigt
- nopayment: Zahlung nicht erfolgt / abgelaufen
- cancelled: Storniert (z.B. Gutschein-Buchung)
- refunded: Storniert mit Stripe-Rückerstattung
- partial_refund: Teilerstattung
- our_cancellation: Von uns storniert (z.B. Wetter)

ZAHLUNGSMETHODEN:
- online: Stripe (Karte/PayPal/Apple Pay/Google Pay)
- cash: Barzahlung vor Ort
- sumup: Kartenzahlung vor Ort (SumUp)
- gift_card: Gutschein
- manual_entry: Manuell nachgetragen (Sammelverkauf)

Wichtige Hinweise:
- Tour-Slugs: IMMER "unterland" oder "premium" verwenden (NICHT "unterland-tour"!)
- Datum immer im Format YYYY-MM-DD
- Uhrzeit immer im Format HH:MM
- Antworte immer auf Deutsch
- Sei präzise und bestätige, was du getan hast
- Heute ist ${new Date().toISOString().slice(0, 10)}
- Bei "morgen" verwende das Datum von morgen
- Bei Preisänderungen: Wenn nur Erwachsenenpreis genannt wird, Kinderpreis beibehalten
- Bei Stornierungen: IMMER Grund angeben und an Rückerstattungen denken
- "Alle Touren morgen canceln" = cancel_departures für BEIDE Tour-Slugs aufrufen`;

export async function POST(req: Request) {
  try {
    // Verify admin session
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nur Administratoren haben Zugriff auf Ops.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const command = body.command;
    const conversationHistory = body.messages || []; // Previous messages for context
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Befehl fehlt.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API-Key nicht konfiguriert.' },
        { status: 500 }
      );
    }

    // Step 1: Send command to GPT with tools
    const initialResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.4-2026-03-05',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10), // Previous context (max 10 messages)
            { role: 'user', content: command },
          ],
          tools: TOOLS,
          tool_choice: 'auto',
        }),
      }
    );

    if (!initialResponse.ok) {
      const errText = await initialResponse.text();
      console.error('OpenAI API error:', errText);
      return NextResponse.json(
        { error: 'KI-Anfrage fehlgeschlagen.' },
        { status: 500 }
      );
    }

    const initialData = await initialResponse.json();
    const assistantMessage = initialData.choices?.[0]?.message;

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Keine Antwort von der KI.' },
        { status: 500 }
      );
    }

    // Step 2: If no tool calls, return the direct response
    if (
      !assistantMessage.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      // Log to operations_log
      await logOperation(command, assistantMessage.content, session.staff_id, []);

      return NextResponse.json({
        summary: assistantMessage.content,
        actions: [],
      });
    }

    // Step 3: Execute each tool call
    const actions: string[] = [];
    const toolResults: { tool_call_id: string; content: string }[] = [];

    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      const result = await executeTool(toolName, toolArgs);
      actions.push(`${toolName}: ${result}`);
      toolResults.push({
        tool_call_id: toolCall.id,
        content: result,
      });
    }

    // Step 4: Send results back to GPT for a human-readable summary
    const summaryResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-5.4-2026-03-05',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: command },
            assistantMessage,
            ...toolResults.map((r) => ({
              role: 'tool' as const,
              tool_call_id: r.tool_call_id,
              content: r.content,
            })),
          ],
        }),
      }
    );

    let summary = actions.join('\n');
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      summary =
        summaryData.choices?.[0]?.message?.content || summary;
    }

    // Step 5: Log everything
    await logOperation(command, summary, session.staff_id, actions);

    // Step 6: Return summary
    return NextResponse.json({
      summary,
      actions,
    });
  } catch (err) {
    console.error('Ops API error:', err);
    return NextResponse.json(
      { error: 'Interner Fehler bei der Verarbeitung.' },
      { status: 500 }
    );
  }
}

async function logOperation(
  command: string,
  result: string,
  staffId: string,
  actions: string[]
) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('operations_log').insert({
      staff_id: staffId,
      command,
      result,
      actions_taken: actions,
      status: 'success',
    });
  } catch (e) {
    console.error('Failed to log operation:', e);
  }
}
