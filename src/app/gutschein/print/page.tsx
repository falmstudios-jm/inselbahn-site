'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

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
      .catch(() => setError('Gutschein konnte nicht geladen werden. Bitte pr\u00FCfen Sie den Code.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">Gutschein wird geladen&hellip;</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <a href="/" className="text-[#F24444] hover:underline font-medium">
            Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  const amountFormatted = data.amount.toFixed(2).replace('.', ',');

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; }
          .print-page {
            width: 210mm;
            height: 297mm;
            margin: 0;
            padding: 0;
            page-break-after: always;
          }
          .print-card {
            box-shadow: none !important;
            border-radius: 0 !important;
          }
        }
        @page {
          size: A4 portrait;
          margin: 0;
        }
      `}</style>

      {/* Print button bar */}
      <div className="no-print bg-gray-100 py-6 px-4 text-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Gutschein-Druckvorschau
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Drucken Sie diese Seite auf A4-Papier und falten Sie sie zweimal in der Mitte, um eine Geschenkkarte zu erhalten.
        </p>
        <button
          onClick={() => window.print()}
          className="bg-[#F24444] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#d93636] transition-colors text-lg"
        >
          Drucken
        </button>
      </div>

      {/* Printable A4 card — 4 panels */}
      <div className="print-page mx-auto bg-white" style={{ width: '210mm', minHeight: '297mm' }}>
        <div className="print-card grid grid-rows-2 grid-cols-2" style={{ width: '210mm', height: '297mm' }}>

          {/* Panel 4 — Back (top-left when unfolded, back when folded) */}
          <div className="flex flex-col items-center justify-center p-8 border-b border-r border-dashed border-gray-200"
               style={{ borderColor: '#e5e5e5' }}>
            <div className="text-center" style={{ transform: 'rotate(180deg)' }}>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Helgol&auml;nder Dienstleistungs GmbH
              </p>
              <p className="text-xs text-gray-400 mb-1">
                Von-Aschen-Str. 594
              </p>
              <p className="text-xs text-gray-400 mb-4">
                27498 Helgoland
              </p>
              <p className="text-xs text-gray-400 mb-1">
                info@helgolandbahn.de
              </p>
              <p className="text-xs text-gray-400">
                helgolandbahn.de
              </p>
              <div className="mt-6 w-16 h-px bg-gray-200 mx-auto" />
              <p className="text-[10px] text-gray-300 mt-3">
                Inselbahn Helgoland
              </p>
              <p className="text-[10px] text-gray-300">
                Gef&uuml;hrte Inselrundfahrten
              </p>
            </div>
          </div>

          {/* Panel 3 — Inside right: Redemption instructions (top-right) */}
          <div className="flex flex-col items-center justify-center p-8 border-b border-dashed"
               style={{ borderColor: '#e5e5e5' }}>
            <div className="text-center" style={{ transform: 'rotate(180deg)' }}>
              <p className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-wide">
                So l&ouml;sen Sie den Gutschein ein
              </p>
              <div className="text-left space-y-4 max-w-[200px] mx-auto">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">1</span>
                  <p className="text-sm text-gray-600">
                    Tour ausw&auml;hlen auf<br />
                    <span className="font-bold text-[#F24444]">helgolandbahn.de</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">2</span>
                  <p className="text-sm text-gray-600">
                    Gutscheincode bei der Buchung eingeben
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F24444] text-white text-xs font-bold flex items-center justify-center">3</span>
                  <p className="text-sm text-gray-600">
                    Betrag wird automatisch verrechnet
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Teileinl&ouml;sung m&ouml;glich.
                </p>
                <p className="text-xs text-gray-400">
                  Restwert bleibt erhalten.
                </p>
              </div>
            </div>
          </div>

          {/* Panel 1 — Front: Title & Code (bottom-left) */}
          <div className="flex flex-col items-center justify-center p-8 border-r border-dashed"
               style={{ borderColor: '#e5e5e5', background: 'linear-gradient(135deg, #F24444 0%, #d93636 100%)' }}>
            <div className="text-center text-white">
              <p className="text-xs uppercase tracking-[4px] mb-2 opacity-80">
                Inselbahn Helgoland
              </p>
              <div className="w-12 h-px bg-white/40 mx-auto mb-4" />
              <h2 className="text-2xl font-bold tracking-wide mb-6">
                GESCHENK&shy;GUTSCHEIN
              </h2>
              <div className="bg-white/20 rounded-xl px-6 py-4 mb-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-widest mb-1 opacity-70">
                  Gutscheincode
                </p>
                <p className="text-xl font-bold tracking-[3px] font-mono">
                  {data.code}
                </p>
              </div>
              <p className="text-3xl font-bold">
                {amountFormatted}&nbsp;&euro;
              </p>
              {data.recipientName && (
                <p className="mt-4 text-sm opacity-80">
                  F&uuml;r {data.recipientName}
                </p>
              )}
            </div>
          </div>

          {/* Panel 2 — Inside left: Amount, validity, message (bottom-right) */}
          <div className="flex flex-col items-center justify-center p-8"
               style={{ borderColor: '#e5e5e5' }}>
            <div className="text-center max-w-[220px]">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                Gutscheinwert
              </p>
              <p className="text-4xl font-bold text-gray-800 mb-6">
                {amountFormatted}&nbsp;&euro;
              </p>

              <div className="w-12 h-px bg-gray-200 mx-auto mb-6" />

              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                G&uuml;ltig bis
              </p>
              <p className="text-lg font-semibold text-gray-700 mb-6">
                {data.validUntil}
              </p>

              {data.recipientMessage && (
                <>
                  <div className="w-12 h-px bg-gray-200 mx-auto mb-4" />
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
                    Pers&ouml;nliche Nachricht
                  </p>
                  <p className="text-sm text-gray-600 italic leading-relaxed">
                    &bdquo;{data.recipientMessage}&ldquo;
                  </p>
                </>
              )}

              {data.purchaserName && (
                <p className="mt-4 text-xs text-gray-400">
                  Von {data.purchaserName}
                </p>
              )}
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-500">Wird geladen&hellip;</p>
      </div>
    }>
      <PrintContent />
    </Suspense>
  );
}
