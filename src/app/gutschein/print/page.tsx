'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';

interface GiftCardData {
  code: string;
  amount: number;
  remaining: number;
  validUntil: string;
  recipientName: string;
  recipientMessage: string;
  purchaserName: string;
}

function PrintContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [data, setData] = useState<GiftCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) {
      setError('Kein Gutscheincode angegeben.');
      setLoading(false);
      return;
    }

    fetch(`/api/gift-card/${encodeURIComponent(code)}/print`)
      .then((res) => {
        if (!res.ok) throw new Error('Gutschein nicht gefunden');
        return res.json();
      })
      .then((d) => setData(d))
      .catch(() => setError('Gutschein konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-400">Gutschein wird geladen…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <a href="/" className="text-[#F24444] hover:underline font-medium">Zur Startseite</a>
        </div>
      </div>
    );
  }

  const amt = data.amount.toFixed(2).replace('.', ',');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* Print button bar */}
      <div className="no-print bg-white border-b py-6 px-4 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Gutschein-Druckvorschau</h1>
        <p className="text-gray-400 text-sm mb-4">Auf A4 drucken und zweimal falten für eine Geschenkkarte.</p>
        <button
          onClick={() => window.print()}
          className="bg-[#F24444] text-white font-bold px-10 py-3 rounded-full hover:bg-[#d93636] transition-colors text-lg"
        >
          🖨️ Jetzt drucken
        </button>
      </div>

      {/* A4 Card — 4 panels in 2x2 grid */}
      <div className="mx-auto bg-white" style={{ width: '210mm', height: '297mm' }}>
        <div className="grid grid-rows-2 grid-cols-2 h-full">

          {/* ═══ TOP-LEFT: Back cover (rotated 180°) ═══ */}
          <div className="border-b border-r border-dashed border-gray-200 flex items-center justify-center p-6" style={{ background: '#f9f9f9' }}>
            <div className="text-center" style={{ transform: 'rotate(180deg)' }}>
              <p className="text-[10px] text-gray-300 uppercase tracking-[3px] mb-4">Inselbahn Helgoland</p>
              <div className="space-y-3 text-xs text-gray-400">
                <p>Helgoländer Dienstleistungs GmbH</p>
                <p>Von-Aschen-Str. 594 · 27498 Helgoland</p>
                <p>info@helgolandbahn.de</p>
              </div>
              <div className="w-12 h-px bg-gray-200 mx-auto my-5" />
              <p className="text-[10px] text-gray-300">Umsatzsteuerfrei gemäß §1 Abs. 2 UStG</p>
            </div>
          </div>

          {/* ═══ TOP-RIGHT: Instructions (rotated 180°) ═══ */}
          <div className="border-b border-dashed border-gray-200 flex items-center justify-center p-8">
            <div className="text-center" style={{ transform: 'rotate(180deg)' }}>
              <p className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">So lösen Sie Ihren Gutschein ein</p>
              <div className="text-left space-y-5 max-w-[220px] mx-auto">
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <p className="text-sm text-gray-600">Besuchen Sie <span className="font-bold text-[#F24444]">helgolandbahn.de</span> und wählen Sie Ihre Tour</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <p className="text-sm text-gray-600">Geben Sie den <span className="font-bold">Gutscheincode</span> im Buchungsschritt „Rabatt" ein</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-sm text-gray-600">Der Betrag wird <span className="font-bold">automatisch verrechnet</span></p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 max-w-[220px] mx-auto">
                <p className="text-xs text-gray-400">✓ Teileinlösung möglich</p>
                <p className="text-xs text-gray-400">✓ Restwert bleibt erhalten</p>
                <p className="text-xs text-gray-400">✓ Für alle Touren einlösbar</p>
              </div>
            </div>
          </div>

          {/* ═══ BOTTOM-LEFT: Front cover (main visual) ═══ */}
          <div
            className="border-r border-dashed border-gray-200 flex flex-col items-center justify-center p-8 relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #F24444 0%, #c62828 50%, #333 100%)' }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

            <div className="text-center text-white relative z-10">
              {/* Logo */}
              <div className="mb-4">
                <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={160} height={40} className="brightness-0 invert mx-auto" />
              </div>
              <div className="w-16 h-px bg-white/30 mx-auto mb-4" />
              <h2 className="text-2xl font-bold tracking-[2px] mb-8">GESCHENKGUTSCHEIN</h2>

              {/* Code */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-5 mb-6 border border-white/20">
                <p className="text-[10px] uppercase tracking-[3px] mb-2 opacity-60">Ihr Code</p>
                <p className="text-2xl font-bold tracking-[4px] font-mono">{data.code}</p>
              </div>

              {/* Amount */}
              <p className="text-4xl font-bold mb-2">{amt} €</p>

              {data.recipientName && (
                <p className="mt-4 text-sm opacity-70">Für {data.recipientName}</p>
              )}
            </div>
          </div>

          {/* ═══ BOTTOM-RIGHT: Inside — personal + recommendations ═══ */}
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-center w-full max-w-[240px]">
              {/* Amount & validity */}
              <p className="text-[10px] text-gray-400 uppercase tracking-[2px] mb-1">Gutscheinwert</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">{amt} €</p>
              <p className="text-xs text-gray-400 mb-5">Gültig bis {data.validUntil}</p>

              {/* Personal message */}
              {data.recipientMessage && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5 text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Persönliche Nachricht</p>
                  <p className="text-sm text-gray-600 italic leading-relaxed">„{data.recipientMessage}"</p>
                  {data.purchaserName && <p className="text-xs text-gray-400 mt-2 text-right">— {data.purchaserName}</p>}
                </div>
              )}

              {!data.recipientMessage && data.purchaserName && (
                <p className="text-xs text-gray-400 mb-5">Von {data.purchaserName}</p>
              )}

              {/* Mini recommendations */}
              <div className="border-t border-gray-100 pt-4 text-left space-y-2">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Unsere Tipps für Helgoland</p>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🍦</span>
                  <p className="text-[11px] text-gray-500 leading-snug">Gelateria Curniciello — Bestes Eis, direkt am Fahrstuhl</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🍽️</span>
                  <p className="text-[11px] text-gray-500 leading-snug">Aquarium Restaurant — Edel, reservieren!</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🐦</span>
                  <p className="text-[11px] text-gray-500 leading-snug">finkapp.eu — Die Vogel-App für Helgoland</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm">🗣️</span>
                  <p className="text-[11px] text-gray-500 leading-snug">halunder.ai — Helgolands Sprache entdecken</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function GutscheinPrintPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-400">Wird geladen…</p>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
