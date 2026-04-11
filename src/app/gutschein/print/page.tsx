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
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
          @page { size: A4 portrait; margin: 0; }
        }
      `}</style>

      {/* Print bar */}
      <div className="no-print bg-white border-b py-5 px-4 text-center sticky top-0 z-50 shadow-sm">
        <p className="text-sm text-gray-400 mb-3">Auf A4 drucken → horizontal falten → vertikal falten → fertig!</p>
        <button onClick={() => window.print()} className="bg-[#F24444] text-white font-bold px-10 py-3 rounded-full hover:bg-[#d93636] transition-colors">
          🖨️ Drucken
        </button>
      </div>
      <div className="no-print h-4" />

      {/* ═══ Single A4 page — 2×2 fold-in-4 ═══ */}
      <div className="mx-auto bg-white" style={{ width: '210mm', height: '297mm' }}>
        <div className="grid grid-rows-2 grid-cols-2 h-full">

          {/* ─── TOP-LEFT: BACK COVER (rotated 180°) ─── */}
          {/* When folded: this is the back of the card */}
          <div className="relative overflow-hidden border-b border-r border-dashed border-gray-300">
            <Image src="/images/topdown.jpg" alt="Helgoland" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6" style={{ transform: 'rotate(180deg)' }}>
              <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={130} height={32} className="brightness-0 invert mb-4" />
              <div className="w-10 h-px bg-white/30 mb-3" />
              <p className="text-[10px] text-white/50 text-center leading-relaxed">
                Helgoländer Dienstleistungs GmbH<br />
                Von-Aschen-Str. 594 · 27498 Helgoland<br />
                info@helgolandbahn.de · helgolandbahn.de
              </p>
              <p className="text-[8px] text-white/30 mt-3 text-center">
                Umsatzsteuerfrei gemäß §1 Abs. 2 UStG (Helgoland)
              </p>
            </div>
          </div>

          {/* ─── TOP-RIGHT: INSTRUCTIONS (rotated 180°) ─── */}
          {/* When folded: inside left panel */}
          <div className="relative overflow-hidden border-b border-dashed border-gray-300 bg-white">
            <div className="absolute inset-0 flex flex-col p-5" style={{ transform: 'rotate(180deg)' }}>
              {/* Mini photo strip at top */}
              <div className="flex gap-1 h-[55px] mb-4 rounded-lg overflow-hidden">
                <div className="flex-1 relative"><Image src="/images/premium-20250814_123019.jpg" alt="" fill className="object-cover" /></div>
                <div className="flex-1 relative"><Image src="/images/666b90144c01c4b5cdca05c0_helgolandbahn-6.jpg" alt="" fill className="object-cover" /></div>
                <div className="flex-1 relative"><Image src="/images/premium-20250807_151052.jpg" alt="" fill className="object-cover" /></div>
              </div>

              <p className="text-[11px] font-bold text-gray-700 mb-3 uppercase tracking-wider">So lösen Sie ein</p>

              <div className="space-y-2.5 mb-4">
                <div className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F24444] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <p className="text-[11px] text-gray-600 leading-snug"><span className="font-bold text-[#F24444]">helgolandbahn.de</span> besuchen</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F24444] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <p className="text-[11px] text-gray-600 leading-snug">Code im Schritt <span className="font-bold">„Rabatt"</span> eingeben</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F24444] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                  <p className="text-[11px] text-gray-600 leading-snug">Betrag wird <span className="font-bold">automatisch verrechnet</span></p>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 space-y-0.5 mb-3">
                <p>✓ Teileinlösung möglich · Restwert bleibt erhalten</p>
                <p>✓ Flexibel für alle Touren einlösbar</p>
              </div>

              {/* Recommendations */}
              <div className="border-t border-gray-100 pt-2.5 space-y-1.5">
                <p className="text-[9px] text-gray-400 uppercase tracking-wider">Unsere Tipps</p>
                <p className="text-[10px] text-gray-500">🍦 Gelateria Curniciello — Bestes Eis am Fahrstuhl</p>
                <p className="text-[10px] text-gray-500">🍽️ Aquarium Restaurant — Edel, reservieren!</p>
                <p className="text-[10px] text-gray-500">🐦 finkapp.eu — Vogel-App für Helgoland</p>
                <p className="text-[10px] text-gray-500">🗣️ halunder.ai — Helgolands Sprache entdecken</p>
              </div>

              {/* Legal micro text */}
              <p className="text-[7px] text-gray-300 mt-auto leading-snug">
                Geldwertgutschein der Helgoländer Dienstleistungs GmbH. Teileinlösung möglich, Restwert bleibt erhalten. Restwert unter 1 € auf Anfrage auszahlbar. Nicht erstattungsfähig. Bei Verlust kein Ersatz. §195/§199 BGB. AGB: helgolandbahn.de/agb
              </p>
            </div>
          </div>

          {/* ─── BOTTOM-LEFT: FRONT COVER ─── */}
          {/* When folded: this is the FRONT of the card */}
          <div className="relative overflow-hidden border-r border-dashed border-gray-300">
            <Image src="/images/premium-20250707_103436.jpg" alt="Inselbahn Helgoland" fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)' }} />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
              <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={140} height={35} className="brightness-0 invert mb-2" />
              <p className="text-[9px] uppercase tracking-[5px] mb-5 opacity-50">Geschenkgutschein</p>

              {/* Code */}
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 mb-4 border border-white/20 text-center w-full max-w-[230px]">
                <p className="text-[8px] uppercase tracking-[2px] mb-1.5 opacity-50">Gutscheincode</p>
                <p className="text-lg font-bold tracking-[3px] font-mono">{data.code}</p>
              </div>

              <p className="text-3xl font-bold mb-1">{amt} €</p>
              <p className="text-[10px] opacity-40">Gültig bis {data.validUntil}</p>

              {data.recipientName && (
                <p className="mt-3 text-sm opacity-60 italic">Für {data.recipientName}</p>
              )}
            </div>
          </div>

          {/* ─── BOTTOM-RIGHT: INSIDE RIGHT — Message + Photos ─── */}
          {/* When folded: inside right panel */}
          <div className="flex flex-col p-5 justify-between">
            {/* Top: amount or message */}
            <div className="text-center">
              {data.recipientMessage ? (
                <div className="bg-[#FFF8F8] rounded-xl p-5 border border-[#F24444]/10">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-2">Persönliche Nachricht</p>
                  <p className="text-[13px] text-gray-700 italic leading-relaxed">„{data.recipientMessage}"</p>
                  {data.purchaserName && <p className="text-[11px] text-gray-400 mt-2 text-right">— {data.purchaserName}</p>}
                </div>
              ) : (
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-[2px] mb-1">Gutscheinwert</p>
                  <p className="text-4xl font-bold text-gray-800 mb-1">{amt} €</p>
                  {data.purchaserName && <p className="text-[11px] text-gray-400">Von {data.purchaserName}</p>}
                </div>
              )}
            </div>

            {/* Middle: photo collage */}
            <div className="my-3">
              <div className="flex gap-1.5 h-[70px]">
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <Image src="/images/premium-20250814_150116.jpg" alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <Image src="/images/premium-20250814_123029.jpg" alt="" fill className="object-cover" />
                </div>
              </div>
              <div className="flex gap-1.5 h-[50px] mt-1.5">
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <Image src="/images/666b9090ffbb1554bef8498f_helgolandbahn-9.jpg" alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <Image src="/images/premium-20250707_103436.jpg" alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 rounded-lg overflow-hidden relative">
                  <Image src="/images/abfahrt-inselbahn.jpg" alt="" fill className="object-cover" />
                </div>
              </div>
            </div>

            {/* Bottom: tagline */}
            <div className="text-center">
              <Image src="/images/inselbahn-logo.svg" alt="Inselbahn" width={100} height={25} className="mx-auto mb-2" />
              <p className="text-[10px] text-gray-400">Geführte Inselrundfahrten auf Helgoland</p>
              <p className="text-[9px] text-gray-300 mt-1">helgolandbahn.de</p>
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
