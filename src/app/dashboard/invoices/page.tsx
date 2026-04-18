'use client';

import { useState, useEffect, useCallback } from 'react';

interface ManualInvoice {
  id: string;
  reference: string;
  customer_email: string;
  amount: number;
  description: string;
  payment_status: 'paid' | 'stripe' | 'transfer';
  invoice_number: string | null;
  invoice_data: Record<string, string> | null;
  stripe_url: string | null;
  created_at: string;
  access_token: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  paid: { label: 'Bezahlt', color: 'bg-green-100 text-green-700' },
  stripe: { label: 'Stripe', color: 'bg-indigo-100 text-indigo-700' },
  transfer: { label: 'Überweisung', color: 'bg-amber-100 text-amber-700' },
};

export default function ManualInvoicesPage() {
  const [invoices, setInvoices] = useState<ManualInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'stripe' | 'transfer'>('transfer');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ ref: string; link: string } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/manual-invoice');
      const data = await res.json();
      setInvoices(data.invoices || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !amount || !description) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/manual-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          amount: parseFloat(amount),
          description: description.trim(),
          payment_status: paymentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmation({ ref: data.reference, link: data.customer_link });
        setEmail(''); setAmount(''); setDescription('');
        load();
      } else {
        setError(data.error || 'Fehler');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28">
      <h1 className="text-xl font-bold text-dark mb-4">Rechnungen</h1>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="text-base font-semibold text-dark mb-3">Neue Rechnung</h2>
        {confirmation ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm font-medium mb-2">
              ✓ Rechnung {confirmation.ref} erstellt und E-Mail gesendet
            </p>
            <a
              href={confirmation.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 underline break-all"
            >
              {confirmation.link}
            </a>
            <button
              onClick={() => setConfirmation(null)}
              className="block mt-3 text-xs font-semibold text-dark/60 hover:text-dark"
            >
              Neue Rechnung erstellen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-dark/60 mb-1">E-Mail des Kunden *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kunde@example.de"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark/60 mb-1">Betrag (€) *</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="230.00"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark/60 mb-1">Beschreibung *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="z.B. Unterland-Tour Sonderfahrt"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-base"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark/60 mb-2">Zahlung</label>
              <div className="grid grid-cols-3 gap-2">
                {(['paid', 'stripe', 'transfer'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setPaymentStatus(k)}
                    className={`py-2.5 rounded-lg text-sm font-semibold border ${
                      paymentStatus === k
                        ? 'bg-dark text-white border-dark'
                        : 'bg-white text-dark border-gray-200'
                    }`}
                  >
                    {k === 'paid' ? 'Bezahlt' : k === 'stripe' ? 'Stripe-Link' : 'Überweisung'}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting || !email || !amount || !description}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Wird erstellt...' : 'Rechnung erstellen & senden'}
            </button>
          </form>
        )}
      </div>

      {/* List */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
        Zuletzt erstellt
      </h2>
      {loading ? (
        <div className="text-center text-gray-400 py-8 text-sm">Laden...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center text-gray-400 py-8 text-sm">Noch keine Rechnungen</div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => {
            const status = STATUS_LABEL[inv.payment_status];
            const link = `${window.location.origin}/manual-invoice/${inv.access_token}`;
            return (
              <div key={inv.id} className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{inv.reference}</span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      {inv.invoice_number && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {inv.invoice_number}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium text-dark truncate">{inv.description}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{inv.customer_email}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-bold text-dark">
                      {Number(inv.amount).toFixed(2).replace('.', ',')} €
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(inv.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-dark"
                  >
                    Kundenlink öffnen
                  </a>
                  {inv.invoice_data && (
                    <a
                      href={`/api/manual-invoice/${inv.access_token}?download=1`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-1.5 text-xs font-semibold rounded-lg bg-dark text-white"
                    >
                      PDF
                    </a>
                  )}
                  {inv.payment_status !== 'paid' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/dashboard/manual-invoice', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: inv.id, payment_status: 'paid' }),
                        });
                        load();
                      }}
                      className="flex-1 text-center py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white"
                    >
                      Als bezahlt markieren
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
