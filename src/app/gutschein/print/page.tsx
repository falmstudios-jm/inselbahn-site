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
    if (!code) { setError('Kein Gutscheincode angegeben.'); setLoading(false); return; }
    fetch(`/api/gift-card/${encodeURIComponent(code)}/print`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((d) => setData(d))
      .catch(() => setError('Gutschein konnte nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Wird geladen…</p></div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error}</p></div>;

  const amt = data.amount.toFixed(2).replace('.', ',');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* Print bar */}
      <div className="no-print bg-white border-b py-6 px-4 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Gutschein-Druckvorschau</h1>
        <p className="text-gray-400 text-sm mb-4">Auf A4 drucken, zweimal falten — fertig ist die Geschenkkarte!</p>
        <button onClick={() => window.print()} className="bg-[#F24444] text-white font-bold px-10 py-3 rounded-full hover:bg-[#d93636] transition-colors text-lg">
          🖨️ Jetzt drucken
        </button>
      </div>

      {/* A4 — 2x2 grid */}
      <div className="mx-auto bg-white" style={{ width: '210mm', height: '297mm' }}>
        <div className="grid grid-rows-2 grid-cols-2 h-full">

          {/* ═══ TOP-LEFT: Back cover (rotated 180°) — Helgoland aerial photo ═══ */}
          <div className="relative border-b border-r border-dashed border-gray-200 overflow-hidden">
            <Image src="/images/topdown.jpg" alt="Helgoland von oben" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(180deg)' }}>
              <div className="text-center text-white px-6">
                <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={140} height={35} className="brightness-0 invert mx-auto mb-4" />
                <div className="w-10 h-px bg-white/40 mx-auto mb-4" />
                <p className="text-xs opacity-60 mb-1">Helgoländer Dienstleistungs GmbH</p>
                <p className="text-xs opacity-60 mb-1">Von-Aschen-Str. 594 · 27498 Helgoland</p>
                <p className="text-xs opacity-60 mb-3">info@helgolandbahn.de</p>
                <p className="text-[10px] opacity-40">Geführte Inselrundfahrten auf Deutschlands einziger Hochseeinsel</p>
              </div>
            </div>
          </div>

          {/* ═══ TOP-RIGHT: Instructions (rotated 180°) — with Inselbahn photo ═══ */}
          <div className="relative border-b border-dashed border-gray-200 overflow-hidden">
            {/* Top half: photo */}
            <div className="absolute top-0 left-0 right-0 h-[40%] overflow-hidden" style={{ transform: 'rotate(180deg)' }}>
              <Image src="/images/premium-20250814_123019.jpg" alt="Premium-Tour" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(180deg)' }}>
              <div className="text-center px-8 pt-6">
                <p className="text-sm font-bold text-gray-700 mb-5 uppercase tracking-wider">So lösen Sie ein</p>
                <div className="text-left space-y-4 max-w-[210px] mx-auto">
                  <div className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    <p className="text-[13px] text-gray-600">Besuchen Sie <span className="font-bold text-[#F24444]">helgolandbahn.de</span></p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <p className="text-[13px] text-gray-600">Code im Schritt <span className="font-bold">„Rabatt"</span> eingeben</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-[11px] font-bold flex items-center justify-center">3</span>
                    <p className="text-[13px] text-gray-600">Betrag wird <span className="font-bold">automatisch verrechnet</span></p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-gray-100 max-w-[210px] mx-auto text-left">
                  <p className="text-[11px] text-gray-400">✓ Teileinlösung möglich — Restwert bleibt erhalten</p>
                  <p className="text-[11px] text-gray-400">✓ Flexibel für alle Touren einlösbar</p>
                  <p className="text-[11px] text-gray-400">✓ Gültig für 3 Jahre (§195 BGB)</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ BOTTOM-LEFT: Front cover — hero photo + code ═══ */}
          <div className="relative border-r border-dashed border-gray-200 overflow-hidden">
            <Image src="/images/premium-20250707_103436.jpg" alt="Inselbahn auf Helgoland" fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-8">
              {/* Logo */}
              <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={150} height={38} className="brightness-0 invert mb-3" />
              <p className="text-[10px] uppercase tracking-[4px] mb-6 opacity-60">Geschenkgutschein</p>

              {/* Code box */}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-5 mb-5 border border-white/25 w-full max-w-[260px] text-center">
                <p className="text-[9px] uppercase tracking-[3px] mb-2 opacity-50">Ihr Gutscheincode</p>
                <p className="text-xl font-bold tracking-[3px] font-mono">{data.code}</p>
              </div>

              {/* Amount */}
              <p className="text-4xl font-bold mb-1">{amt} €</p>
              <p className="text-xs opacity-50">Gültig bis {data.validUntil}</p>

              {data.recipientName && (
                <p className="mt-4 text-sm opacity-70 italic">Für {data.recipientName}</p>
              )}
            </div>
          </div>

          {/* ═══ BOTTOM-RIGHT: Inside — message + recommendations ═══ */}
          <div className="flex flex-col justify-between p-7">
            {/* Top: personal message or amount */}
            <div className="text-center">
              {data.recipientMessage ? (
                <div className="bg-[#FFF5F5] rounded-xl p-5 mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Persönliche Nachricht</p>
                  <p className="text-sm text-gray-700 italic leading-relaxed">„{data.recipientMessage}"</p>
                  {data.purchaserName && <p className="text-xs text-gray-400 mt-3">— {data.purchaserName}</p>}
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-[2px] mb-1">Gutscheinwert</p>
                  <p className="text-3xl font-bold text-gray-800">{amt} €</p>
                  {data.purchaserName && <p className="text-xs text-gray-400 mt-2">Von {data.purchaserName}</p>}
                </div>
              )}
            </div>

            {/* Middle: mini photo strip */}
            <div className="flex gap-2 my-3">
              <div className="flex-1 h-16 rounded-lg overflow-hidden relative">
                <Image src="/images/premium-20250814_150116.jpg" alt="Helgoland" fill className="object-cover" />
              </div>
              <div className="flex-1 h-16 rounded-lg overflow-hidden relative">
                <Image src="/images/666b90144c01c4b5cdca05c0_helgolandbahn-6.jpg" alt="Tour" fill className="object-cover" />
              </div>
              <div className="flex-1 h-16 rounded-lg overflow-hidden relative">
                <Image src="/images/premium-20250807_151052.jpg" alt="Klippen" fill className="object-cover" />
              </div>
            </div>

            {/* Bottom: recommendations */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Unsere Tipps für Ihren Besuch</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍦</span>
                  <p className="text-[11px] text-gray-500">Gelateria Curniciello — Bestes Eis, direkt am Fahrstuhl</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍽️</span>
                  <p className="text-[11px] text-gray-500">Aquarium Restaurant — Edel, unbedingt reservieren</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🐦</span>
                  <p className="text-[11px] text-gray-500">finkapp.eu — Vogel-App für Helgoland & Europa</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗣️</span>
                  <p className="text-[11px] text-gray-500">halunder.ai — Helgolands Sprache entdecken</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Wird geladen…</p></div>}>
      <PrintContent />
    </Suspense>
  );
}
