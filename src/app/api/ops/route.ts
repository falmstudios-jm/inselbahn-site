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
        'Cancel all bookings for a specific tour on a specific date. Issues refunds and sends cancellation emails.',
      parameters: {
        type: 'object',
        properties: {
          tour_slug: { type: 'string', enum: ['unterland', 'premium'] },
          date: { type: 'string', description: 'YYYY-MM-DD format' },
          reason: { type: 'string' },
        },
        required: ['date'],
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
      description: 'Issue a partial refund for a booking',
      parameters: {
        type: 'object',
        properties: {
          booking_reference: { type: 'string' },
          amount: { type: 'number', description: 'Amount in EUR to refund' },
          reason: { type: 'string' },
        },
        required: ['booking_reference', 'amount'],
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
- Bei neuen Abfahrten: Frage ob online buchbar
- Generell: Wenn der Nutzer etwas unklar formuliert, frage ZUERST nach bevor du handelst!

SICHERHEIT — GEFÄHRLICHE AKTIONEN:
Die folgenden Aktionen sind GEFÄHRLICH und erfordern das Sicherheitspasswort:
- cancel_departures (Massenstornierung + Rückerstattungen)
- partial_refund (Geld wird ausgezahlt)
- Preisänderungen über 20% Abweichung vom aktuellen Preis
- Löschung von Abfahrten

Wenn eine gefährliche Aktion angefragt wird:
1. Erkläre was du tun wirst und welche Auswirkungen es hat (z.B. "X Buchungen werden storniert, Y € werden erstattet")
2. Frage: "Dies ist eine kritische Aktion. Bitte bestätigen Sie mit dem Sicherheitspasswort."
3. Der Nutzer muss das Passwort "GER12234+GER12956!" eingeben
4. ERST DANN ausführen
5. Wenn das Passwort falsch ist: "Falsches Sicherheitspasswort. Aktion abgebrochen."

Du hast Zugriff auf folgende Funktionen:
- Tourpreise ändern (update_tour_price)
- Buchungen stornieren und erstatten (cancel_departures) ⚠️ GEFÄHRLICH
- Website-Ankündigungen erstellen (create_announcement)
- Abfahrtszeiten hinzufügen (add_departure) oder entfernen (remove_departure) ⚠️ GEFÄHRLICH
- Kapazität ändern (update_capacity)
- Umsatz abfragen (get_revenue)
- Buchungen anzeigen (get_bookings)
- Rabattcodes erstellen (create_discount_code)
- Teilerstattungen (partial_refund) ⚠️ GEFÄHRLICH

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
