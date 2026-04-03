'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const GIFT_PRESETS = [
  { id: 'unterland', label: 'Unterland-Tour', basePrice: 11 },
  { id: 'premium', label: 'Premium-Tour', basePrice: 22 },
];

const COUNTRY_OPTIONS = [
  'Deutschland', 'Österreich', 'Schweiz', 'Niederlande', 'Belgien',
  'Dänemark', 'Polen', 'Frankreich', 'Luxemburg', 'Tschechien',
  'Vereinigtes Königreich', 'Schweden', 'Norwegen', 'Italien', 'Spanien',
];

export default function GutscheinPage() {
  const [presetQuantities, setPresetQuantities] = useState<Record<string, number>>({ unterland: 0, premium: 1 });
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const [recipientName, setRecipientName] = useState('');
  const [recipientMessage, setRecipientMessage] = useState('');
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [gdprAccepted, setGdprAccepted] = useState(false);

  // Invoice fields
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState('');
  const [invoiceStreet, setInvoiceStreet] = useState('');
  const [invoicePostalCode, setInvoicePostalCode] = useState('');
  const [invoiceCity, setInvoiceCity] = useState('');
  const [invoiceCountry, setInvoiceCountry] = useState('Deutschland');
  const [invoiceVatId, setInvoiceVatId] = useState('');

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presetTotal = GIFT_PRESETS.reduce(
    (sum, p) => sum + p.basePrice * (presetQuantities[p.id] || 0),
    0
  );
  const hasPresets = presetTotal > 0;
  const amount = isCustom ? parseFloat(customAmount) || 0 : presetTotal;

  const handlePresetQty = (id: string, delta: number) => {
    setPresetQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(20, current + delta));
      return { ...prev, [id]: next };
    });
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setCustomAmount(val);
    setIsCustom(true);
  };

  const handleSubmit = useCallback(async () => {
    if (!gdprAccepted) {
      setError('Bitte akzeptieren Sie die AGB und Datenschutzbestimmungen.');
      return;
    }
    if (amount < 5 || amount > 500) {
      setError('Bitte w\u00E4hlen Sie einen Betrag zwischen 5\u00A0\u20AC und 500\u00A0\u20AC.');
      return;
    }
    if (!purchaserName.trim() || !purchaserEmail.trim()) {
      setError('Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse ein.');
      return;
    }
    if (wantsInvoice && (!invoiceCompany.trim() || !invoiceStreet.trim() || !invoicePostalCode.trim() || !invoiceCity.trim())) {
      setError('Bitte füllen Sie alle Rechnungsfelder aus.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          purchaser_name: purchaserName.trim(),
          purchaser_email: purchaserEmail.trim(),
          recipient_name: recipientName.trim() || undefined,
          recipient_message: recipientMessage.trim() || undefined,
          ...(wantsInvoice
            ? {
                invoice: {
                  company_name: invoiceCompany.trim(),
                  street: invoiceStreet.trim(),
                  postal_code: invoicePostalCode.trim(),
                  city: invoiceCity.trim(),
                  country: invoiceCountry,
                  ...(invoiceVatId.trim() ? { vat_id: invoiceVatId.trim() } : {}),
                },
              }
            : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ein Fehler ist aufgetreten.');
        return;
      }

      setClientSecret(data.client_secret);
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [amount, purchaserName, purchaserEmail, recipientName, recipientMessage, gdprAccepted, wantsInvoice, invoiceCompany, invoiceStreet, invoicePostalCode, invoiceCity, invoiceCountry, invoiceVatId]);

  const inputClass =
    'w-full py-3 px-4 rounded-lg border-2 border-gray-200 text-dark placeholder-dark/40 outline-none focus:border-primary transition-all';

  return (
    <>
      <Header />
    <main className="min-h-screen bg-white px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zur Startseite
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-3">
          Geschenkgutschein
        </h1>
        <p className="text-dark/60 text-lg mb-4">
          Das perfekte Geschenk f&uuml;r Helgoland-Fans
        </p>
        <p className="text-dark/50 text-sm mb-10">
          Gültig bis zum 31.12. des dritten Jahres nach Kauf (§195/§199 BGB). Teileinlösung möglich, Restwert bleibt erhalten.
        </p>

        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#F24444',
                  fontFamily: 'Montserrat, sans-serif',
                },
              },
              locale: 'de',
            }}
          >
            <PaymentForm amount={amount} />
          </Elements>
        ) : (
          <div className="space-y-8">
            {/* Amount Selection */}
            <section>
              <label className="block text-sm font-semibold text-dark mb-3">
                Betrag w&auml;hlen
              </label>

              {/* Preset tour quantities */}
              <div className="space-y-3 mb-4">
                {GIFT_PRESETS.map((preset) => {
                  const qty = presetQuantities[preset.id] || 0;
                  const lineTotal = preset.basePrice * qty;
                  return (
                    <div
                      key={preset.id}
                      className={`flex items-center justify-between gap-4 py-3 px-4 rounded-xl border-2 transition-all ${
                        !isCustom && qty > 0
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-dark">
                          {qty > 0 ? `${qty}\u00D7 ` : ''}{preset.label}
                        </span>
                        <span className="block text-xs text-dark/50">
                          {preset.basePrice.toFixed(2).replace('.', ',')}&nbsp;&euro; pro St&uuml;ck
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePresetQty(preset.id, -1)}
                          disabled={qty <= 0}
                          className="w-9 h-9 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center justify-center text-dark text-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          &minus;
                        </button>
                        <span className="w-8 text-center text-base font-bold text-dark">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePresetQty(preset.id, 1)}
                          disabled={qty >= 20}
                          className="w-9 h-9 rounded-lg border border-gray-200 hover:border-gray-300 flex items-center justify-center text-dark text-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      {qty > 0 && (
                        <span className="text-lg font-bold text-primary w-20 text-right">
                          {lineTotal.toFixed(2).replace('.', ',')}&nbsp;&euro;
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-dark/40 uppercase tracking-wide">oder</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Custom amount (no +/- buttons) */}
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Eigener Betrag (5 € – 500 €)"
                  value={customAmount}
                  onFocus={handleCustomFocus}
                  onChange={handleCustomChange}
                  className={`w-full py-3 px-4 pr-10 rounded-lg border-2 text-dark placeholder-dark/40 outline-none transition-all ${
                    isCustom
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/40 font-medium">
                  &euro;
                </span>
              </div>
            </section>

            {/* Recipient (optional) */}
            <section>
              <h2 className="text-sm font-semibold text-dark mb-3">
                Empf&auml;nger <span className="font-normal text-dark/40">(optional)</span>
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name des Empf&auml;ngers"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={inputClass}
                />
                <textarea
                  placeholder="Pers&ouml;nliche Nachricht"
                  rows={3}
                  value={recipientMessage}
                  onChange={(e) => setRecipientMessage(e.target.value)}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </section>

            {/* Purchaser */}
            <section>
              <h2 className="text-sm font-semibold text-dark mb-3">
                Ihre Daten
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ihr Name"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            </section>

            {/* Invoice option */}
            <section>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(e) => setWantsInvoice(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-primary"
                />
                <span className="text-sm text-dark/60 leading-relaxed">
                  Ich ben&ouml;tige eine Rechnung
                </span>
              </label>

              {wantsInvoice && (
                <div className="space-y-3 mt-4 pl-7 border-l-2 border-dark/10 ml-2">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Firma / Name</label>
                    <input type="text" value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} placeholder="Musterfirma GmbH" className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Stra&szlig;e &amp; Hausnr.</label>
                    <input type="text" value={invoiceStreet} onChange={(e) => setInvoiceStreet(e.target.value)} placeholder="Musterstra&szlig;e 1" className={inputClass} />
                  </div>
                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <label className="block text-sm font-medium text-dark mb-1.5">PLZ</label>
                      <input type="text" value={invoicePostalCode} onChange={(e) => setInvoicePostalCode(e.target.value)} placeholder="12345" className={inputClass} />
                    </div>
                    <div className="w-2/3">
                      <label className="block text-sm font-medium text-dark mb-1.5">Ort</label>
                      <input type="text" value={invoiceCity} onChange={(e) => setInvoiceCity(e.target.value)} placeholder="Berlin" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Land</label>
                    <select value={invoiceCountry} onChange={(e) => setInvoiceCountry(e.target.value)} className={inputClass}>
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">USt-IdNr. <span className="text-dark/40 font-normal">(optional)</span></label>
                    <input type="text" value={invoiceVatId} onChange={(e) => setInvoiceVatId(e.target.value)} placeholder="DE123456789" className={inputClass} />
                  </div>
                </div>
              )}
            </section>

            {/* AGB + GDPR Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={gdprAccepted}
                onChange={(e) => setGdprAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 accent-primary"
              />
              <span className="text-sm text-dark/60 leading-relaxed">
                Ich akzeptiere die{' '}
                <Link href="/agb" className="text-primary hover:underline" target="_blank">
                  AGB
                </Link>{' '}
                und stimme der Verarbeitung meiner Daten gem&auml;&szlig; der{' '}
                <Link href="/datenschutz" className="text-primary hover:underline" target="_blank">
                  Datenschutzerkl&auml;rung
                </Link>{' '}
                zu.
              </span>
            </label>

            <p className="text-xs text-dark/40 -mt-4 pl-7">
              Hinweis: Bei Freizeitveranstaltungen mit festem Termin besteht kein Widerrufsrecht (&sect;312g Abs. 2 Nr. 9 BGB).
            </p>

            {/* Tax-free notice */}
            <p className="text-xs text-dark/40 -mt-4">
              Alle Preise sind Endpreise. Gem&auml;&szlig; &sect;1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
            </p>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || amount < 5}
              className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading
                ? 'Wird geladen\u2026'
                : `Gutschein kaufen \u2014 ${amount.toFixed(2).replace('.', ',')}\u00A0\u20AC`}
            </button>
          </div>
        )}
      </div>
    </main>
      <Footer />
    </>
  );
}

/* ── Stripe Payment Form ── */

function PaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setPaying(true);
    setPayError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/gutschein/danke`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setPayError(error.message || 'Zahlung fehlgeschlagen.');
      setPaying(false);
    } else {
      setSuccess(true);
      setPaying(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-success">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-dark mb-2">Vielen Dank!</h2>
        <p className="text-dark/60">
          Ihr Gutschein &uuml;ber {amount.toFixed(2).replace('.', ',')}&nbsp;&euro; wurde erfolgreich gekauft.
          <br />
          Sie erhalten den Gutscheincode per E-Mail.
        </p>
        <p className="text-dark/40 text-xs mt-4">
          Alle Preise sind Endpreise. Gem&auml;&szlig; &sect;1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
        </p>
        <Link
          href="/"
          className="inline-block mt-8 text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Zur&uuml;ck zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-surface rounded-xl p-5 mb-2">
        <p className="text-sm text-dark/60 mb-1">Gutschein-Betrag</p>
        <p className="text-2xl font-bold text-dark">
          {amount.toFixed(2).replace('.', ',')}&nbsp;&euro;
        </p>
      </div>

      <PaymentElement />

      {payError && (
        <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
          {payError}
        </p>
      )}

      <button
        type="submit"
        disabled={paying || !stripe}
        className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {paying ? 'Zahlung wird verarbeitet\u2026' : `Jetzt ${amount.toFixed(2).replace('.', ',')}\u00A0\u20AC bezahlen`}
      </button>

      <p className="text-xs text-dark/40 text-center">
        Alle Preise sind Endpreise. Gem&auml;&szlig; &sect;1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
      </p>
    </form>
  );
}
