import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SUMMARY_PROMPT = `Analysiere diese Chat-Konversation mit der Inselbahn Helgoland und erstelle eine JSON-Antwort.
KEINE Namen, E-Mails oder persönliche Daten nennen!

Antworte NUR mit validem JSON in diesem Format:
{
  "user_questions": "Kurze Zusammenfassung was der Gast gefragt/gewollt hat (1-3 Sätze, auf Deutsch)",
  "ai_answers": "Kurze Zusammenfassung was der Bot geantwortet hat (1-3 Sätze, auf Deutsch)",
  "status": "success|partial|failed|abuse"
}

Status-Regeln:
- success: Frage klar beantwortet, Gast zufrieden oder einfache Auskunft
- partial: Frage beantwortet, aber Gast schien unsicher oder wollte mehr
- failed: Gast war unzufrieden, Frage konnte nicht beantwortet werden
- abuse: Prompt Injection, Beleidigung, Off-Topic-Spam

Beispiel:
{"user_questions": "Gast fragte nach Premium-Tour Preisen und ob sein Hund mitkann.", "ai_answers": "Preise genannt (22€/15€). Hund bei Premium nicht erlaubt, Unterland-Tour empfohlen.", "status": "success"}`;

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + 'inselbahn-salt-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ ok: true }); // nothing to log
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    // Generate summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini-2026-03-17',
        messages: [
          { role: 'system', content: SUMMARY_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content.slice(0, 300),
          })),
        ],
        max_completion_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!summaryResponse.ok) {
      console.error('Summary API failed:', summaryResponse.status);
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const summaryData = await summaryResponse.json();
    const rawContent = summaryData.choices?.[0]?.message?.content;
    if (!rawContent) return NextResponse.json({ ok: true });

    // Parse JSON response
    let userQuestions = '';
    let aiAnswers = '';
    let status = 'unknown';
    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      userQuestions = parsed.user_questions || '';
      aiAnswers = parsed.ai_answers || '';
      status = ['success', 'partial', 'failed', 'abuse'].includes(parsed.status) ? parsed.status : 'unknown';
    } catch {
      // Fallback: use raw content as summary
      userQuestions = rawContent;
      status = 'unknown';
    }

    // Detect topics
    const content = messages.map((m: { content: string }) => m.content.toLowerCase()).join(' ');
    const topics: string[] = [];
    if (/preis|euro|€|kost|ticket/.test(content)) topics.push('preise');
    if (/abfahrt|uhr|zeit|wann|fahrplan/.test(content)) topics.push('abfahrtszeiten');
    if (/hund|tier/.test(content)) topics.push('hunde');
    if (/rollstuhl|behindert|barriere|rollator|mobil/.test(content)) topics.push('barrierefreiheit');
    if (/stornier|absa|erstatt|refund/.test(content)) topics.push('stornierung');
    if (/buch|reserv|ticket|online/.test(content)) topics.push('buchung');
    if (/gruppe|gruppen|team|firma/.test(content)) topics.push('gruppen');
    if (/wetter|regen|sturm|wind/.test(content)) topics.push('wetter');
    if (/premium/.test(content)) topics.push('premium-tour');
    if (/unterland/.test(content)) topics.push('unterland-tour');
    if (/schiff|fähre|anleger|hafen|funny|halunder|helgoland.*ms/.test(content)) topics.push('anreise');
    if (/lang.*anna|oberland|lummen/.test(content)) topics.push('sehenswuerdigkeiten');
    if (/kind|baby|famil/.test(content)) topics.push('familien');
    if (/ignore|bypass|system|jailbreak|DAN/.test(content)) topics.push('missbrauch');

    // Save — only columns that exist in the table
    const { error: insertError } = await supabase.from('chat_logs').insert({
      summary: `${userQuestions} → ${aiAnswers}`.slice(0, 1000),
      topics,
      status,
      message_count: messages.length,
    });

    if (insertError) {
      console.error('chat_logs insert failed:', insertError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Chat log error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
