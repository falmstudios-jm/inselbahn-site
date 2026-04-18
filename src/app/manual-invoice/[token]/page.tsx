'use client';

import { use, useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface InvoiceData {
  reference: string;
  description: string;
  amount: number;
  payment_status: 'paid' | 'stripe' | 'transfer';
  stripe_url?: string | null;
  invoice_data?: Record<string, string> | null;
  invoice_number?: string | null;
  service_date?: string | null;
  customer_reference?: string | null;
}

export default function ManualInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Deutschland');
  const [vatId, setVatId] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/manual-invoice/${token}`);
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          setError(d.error || 'Rechnung nicht gefunden');
          return;
        }
        const data: InvoiceData = await res.json();
        setInvoice(data);
        if (data.invoice_data) {
          setName(data.invoice_data.name || '');
          setStreet(data.invoice_data.street || '');
          setPostalCode(data.invoice_data.postal_code || '');
          setCity(data.invoice_data.city || '');
          setCountry(data.invoice_data.country || 'Deutschland');
          setVatId(data.invoice_data.vat_id || '');
        }
        if (data.customer_reference) setCustomerReference(data.customer_reference);
      } catch {
        setError('Verbindungsfehler');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !street || !postalCode || !city) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/manual-invoice/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_data: {
            name, street, postal_code: postalCode, city, country, vat_id: vatId,
          },
          customer_reference: customerReference,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || 'Fehler beim Speichern');
        return;
      }
      // Open PDF
      window.open(`/api/manual-invoice/${token}?download=1`, '_blank');
      // Refresh state
      const freshRes = await fetch(`/api/manual-invoice/${token}`);
      if (freshRes.ok) setInvoice(await freshRes.json());
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setSubmitting(false);
    }
  }

  const formatAmount = (n: number) => n.toFixed(2).replace('.', ',') + ' €';

  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1 bg-primary" />
            <div className="p-6 md:p-8">
              <h1 className="text-2xl font-bold text-dark mb-2">Rechnung</h1>

              {loading ? (
                <p className="text-dark/50 text-sm">Laden...</p>
              ) : error ? (
                <p className="text-red-600 text-sm">{error}</p>
              ) : invoice ? (
                <>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                    <div>
                      <span className="text-dark/50">Referenz:</span>{' '}
                      <span className="font-mono font-semibold">{invoice.reference}</span>
                    </div>
                    <div>
                      <span className="text-dark/50">Beschreibung:</span>{' '}
                      <span className="font-medium">{invoice.description}</span>
                    </div>
                    <div>
                      <span className="text-dark/50">Betrag:</span>{' '}
                      <span className="font-bold text-lg">{formatAmount(invoice.amount)}</span>
                    </div>
                  </div>

                  {/* Payment status */}
                  {invoice.payment_status === 'paid' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm font-medium text-green-800">
                      ✓ Bereits bezahlt
                    </div>
                  )}
                  {invoice.payment_status === 'stripe' && invoice.stripe_url && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-center">
                      <p className="text-sm text-dark mb-3">Online-Zahlung (Karte, SEPA, PayPal):</p>
                      <a
                        href={invoice.stripe_url}
                        className="inline-block bg-primary text-white font-semibold py-3 px-6 rounded-lg"
                      >
                        {formatAmount(invoice.amount)} jetzt bezahlen
                      </a>
                    </div>
                  )}
                  {invoice.payment_status === 'transfer' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm">
                      <p className="font-semibold text-dark mb-2">Bitte überweisen:</p>
                      <p className="text-dark/80 leading-relaxed">
                        Helgoländer Dienstleistungs GmbH<br />
                        IBAN: DE94 2175 0000 0190 1018 87<br />
                        BIC: NOLADE21NOS<br />
                        Verwendungszweck: <strong>{invoice.reference}</strong>
                      </p>
                    </div>
                  )}

                  <h2 className="text-lg font-bold text-dark mb-4">Rechnungsdaten</h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-dark/60 mb-1">
                        Name / Firmenname *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark/60 mb-1">Straße & Hausnummer *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-xs font-semibold text-dark/60 mb-1">PLZ *</label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-dark/60 mb-1">Ort *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark/60 mb-1">Land</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark/60 mb-1">USt-IdNr. (optional)</label>
                      <input
                        type="text"
                        value={vatId}
                        onChange={(e) => setVatId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark/60 mb-1">Ihr Zeichen / Bestellnummer (optional)</label>
                      <input
                        type="text"
                        value={customerReference}
                        onChange={(e) => setCustomerReference(e.target.value)}
                        placeholder="z.B. Reisegruppe Müller"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting || !name || !street || !postalCode || !city}
                      className="w-full bg-primary text-white font-bold py-4 rounded-xl text-base disabled:opacity-50 mt-2"
                    >
                      {submitting ? 'Speichere...' : 'Rechnung als PDF herunterladen'}
                    </button>
                  </form>

                  {invoice.invoice_number && (
                    <p className="text-center text-xs text-dark/50 mt-4">
                      Rechnungsnummer: <span className="font-mono">{invoice.invoice_number}</span>
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
