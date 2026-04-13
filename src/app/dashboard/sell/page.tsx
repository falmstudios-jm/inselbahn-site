'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../dashboard-shell';

interface AvailableSlot {
  departure_id: string;
  departure_time: string;
  tour_name: string;
  tour_slug: string;
  max_capacity: number;
  booked: number;
  remaining: number;
  price_adult: number;
  price_child: number;
}

type SellMode = 'individual' | 'bulk';

export default function SellPage() {
  const { name: staffName } = useDashboard();

  // Always today (Berlin timezone), no date selector
  const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  const selectedDate = todayISO;

  const todayLabel = (() => {
    const d = new Date(todayISO + 'T12:00:00');
    const weekday = d.toLocaleDateString('de-DE', { weekday: 'short', timeZone: 'Europe/Berlin' });
    const day = d.getDate();
    const month = d.toLocaleDateString('de-DE', { month: 'short', timeZone: 'Europe/Berlin' });
    return `Heute, ${weekday} ${day}. ${month}`;
  })();

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [mode, setMode] = useState<SellMode>('individual');

  // Individual mode state
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenFree, setChildrenFree] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sumup'>('cash');
  const [customerName, setCustomerName] = useState('');

  // Bulk mode state
  const [bulkAdults, setBulkAdults] = useState(0);
  const [bulkChildren, setBulkChildren] = useState(0);
  const [barAmount, setBarAmount] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [bulkNote, setBulkNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    total: number;
    isBulk: boolean;
  } | null>(null);
  const [error, setError] = useState('');

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/departures?date=${selectedDate}&include_prices=1`);
      const data = await res.json();
      setSlots(data.departures || []);
    } catch {
      console.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    setSelectedSlot(null);
    loadSlots();
  }, [loadSlots]);

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const getTourColor = (slug: string) => {
    if (slug.includes('unterland')) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
    return { bg: 'bg-blue-50', text: 'text-[#1B2A4A]', dot: 'bg-[#1B2A4A]' };
  };

  const totalPrice = selectedSlot
    ? adults * selectedSlot.price_adult + children * selectedSlot.price_child
    : 0;

  const handleSellIndividual = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/dashboard/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          departure_id: selectedSlot.departure_id,
          booking_date: selectedDate,
          adults,
          children,
          children_free: childrenFree,
          payment_method: paymentMethod,
          customer_name: customerName || (paymentMethod === 'cash' ? 'Barzahlung' : 'SumUp-Zahlung'),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConfirmation({
          reference: data.booking_reference,
          total: data.total_amount,
          isBulk: false,
        });
      } else {
        setError(data.error || 'Fehler beim Erstellen');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellBulk = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/dashboard/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'bulk',
          departure_id: selectedSlot.departure_id,
          booking_date: selectedDate,
          adults: bulkAdults,
          children: bulkChildren,
          bar_amount: parseFloat(barAmount) || 0,
          card_amount: parseFloat(cardAmount) || 0,
          note: bulkNote,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConfirmation({
          reference: data.booking_reference,
          total: data.total_amount,
          isBulk: true,
        });
      } else {
        setError(data.error || 'Fehler beim Eintragen');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedSlot(null);
    setMode('individual');
    setAdults(1);
    setChildren(0);
    setChildrenFree(0);
    setPaymentMethod('cash');
    setCustomerName('');
    setBulkAdults(0);
    setBulkChildren(0);
    setBarAmount('');
    setCardAmount('');
    setBulkNote('');
    setConfirmation(null);
    setError('');
    loadSlots();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Laden...</div>
      </div>
    );
  }

  // Confirmation view
  if (confirmation) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center max-w-sm w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-dark mb-2">
            {confirmation.isBulk ? 'Eingetragen!' : 'Ticket erstellt!'}
          </h2>

          <div className="text-3xl font-mono font-bold text-primary mb-2">
            {confirmation.reference}
          </div>

          <div className="text-2xl font-bold text-dark mb-6">
            {confirmation.total.toFixed(2)} &euro;
          </div>

          {confirmation.isBulk && (
            <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg">
              Sammelverkauf von {staffName} eingetragen
            </div>
          )}

          {/* Invoice email option */}
          {!confirmation.isBulk && <InvoiceEmailSection bookingReference={confirmation.reference} />}

          <button
            onClick={resetForm}
            className="w-full bg-primary text-white font-semibold py-4 rounded-lg text-lg active:scale-[0.98] transition-transform"
          >
            {confirmation.isBulk ? 'Weiterer Eintrag' : 'Neues Ticket'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-dark mb-3">Ticket verkaufen</h1>

      {/* Static date display (today only) */}
      <div className="flex items-center justify-center mb-4 bg-white rounded-xl p-3 shadow-sm border border-gray-200">
        <div className="font-semibold text-dark">{todayLabel}</div>
      </div>

      {/* Mode toggle */}
      {!selectedSlot && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setMode('individual')}
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
              mode === 'individual'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Einzelverkauf
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
              mode === 'bulk'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Sammelverkauf
          </button>
        </div>
      )}

      {/* Step 1: Select departure */}
      {!selectedSlot ? (
        <div>
          {mode === 'bulk' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
              <strong>Sammelverkauf:</strong> Tickets ohne Handy verkauft? Hier nachtragen.
            </div>
          )}

          <p className="text-sm text-gray-500 mb-3">Abfahrt w&auml;hlen:</p>
          <div className="space-y-2">
            {slots
              .filter((s) => {
                // For bulk mode, show all departures (even past ones for today)
                if (mode === 'bulk') return true;
                // For individual mode, only future departures with capacity
                const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
                const now = new Date(nowBerlin);
                const [h, m] = s.departure_time.split(':').map(Number);
                const depDate = new Date(now);
                depDate.setHours(h, m, 0, 0);
                return depDate > now && s.remaining > 0;
              })
              .map((slot) => {
                const colors = getTourColor(slot.tour_slug);
                return (
                  <button
                    key={slot.departure_id}
                    onClick={() => setSelectedSlot(slot)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                        <span className="text-lg font-semibold text-dark">
                          {formatTime(slot.departure_time)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {slot.tour_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          slot.remaining <= 3 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {slot.remaining} frei
                        </div>
                        {mode === 'individual' && (
                          <div className="text-xs text-gray-400">
                            ab {slot.price_adult}&euro;
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

            {slots.filter((s) => {
              if (mode === 'bulk') return true;
              const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
              const now = new Date(nowBerlin);
              const [h, m] = s.departure_time.split(':').map(Number);
              const depDate = new Date(now);
              depDate.setHours(h, m, 0, 0);
              return depDate > now && s.remaining > 0;
            }).length === 0 && (
              <div className="text-center text-gray-400 py-12">
                Keine verf&uuml;gbaren Abfahrten
              </div>
            )}
          </div>
        </div>
      ) : mode === 'individual' ? (
        /* Individual sale form */
        <div>
          <button
            onClick={() => setSelectedSlot(null)}
            className="text-sm text-gray-500 mb-4 flex items-center gap-1"
          >
            &larr; Andere Abfahrt w&auml;hlen
          </button>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getTourColor(selectedSlot.tour_slug).dot}`} />
              <div className="text-lg font-semibold text-dark">
                {formatTime(selectedSlot.departure_time)} — {selectedSlot.tour_name}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Noch {selectedSlot.remaining} Pl&auml;tze frei
            </div>
          </div>

          {/* Customer name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="z.B. M&uuml;ller"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Counter: Adults */}
          <CounterRow
            label="Erwachsene"
            sublabel={`${selectedSlot.price_adult}\u20AC pro Person`}
            value={adults}
            onDecrement={() => setAdults(Math.max(0, adults - 1))}
            onIncrement={() => setAdults(adults + 1)}
          />

          {/* Counter: Children paid */}
          <CounterRow
            label="Kinder (bis 15 J.)"
            sublabel={`${selectedSlot.price_child}\u20AC pro Kind`}
            value={children}
            onDecrement={() => setChildren(Math.max(0, children - 1))}
            onIncrement={() => setChildren(children + 1)}
          />

          {/* Counter: Children free */}
          <CounterRow
            label="Kinder (0-5)"
            sublabel="0\u20AC"
            value={childrenFree}
            onDecrement={() => setChildrenFree(Math.max(0, childrenFree - 1))}
            onIncrement={() => setChildrenFree(childrenFree + 1)}
          />

          {/* Payment method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Zahlungsart
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border-2 text-center font-semibold text-lg transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-dark'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setPaymentMethod('sumup')}
                className={`p-4 rounded-xl border-2 text-center font-semibold text-lg transition-colors ${
                  paymentMethod === 'sumup'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 bg-white text-dark'
                }`}
              >
                Karte (SumUp)
              </button>
            </div>
          </div>

          {/* Total + submit */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-dark">Gesamt</span>
              <span className="text-2xl font-bold text-primary">
                {totalPrice.toFixed(2)} &euro;
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSellIndividual}
            disabled={submitting || (adults === 0 && children === 0 && childrenFree === 0)}
            className="w-full bg-primary text-white font-bold py-5 rounded-xl text-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Erstelle...' : 'Verkaufen'}
          </button>
        </div>
      ) : (
        /* Bulk entry form */
        <div>
          <button
            onClick={() => setSelectedSlot(null)}
            className="text-sm text-gray-500 mb-4 flex items-center gap-1"
          >
            &larr; Andere Abfahrt w&auml;hlen
          </button>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getTourColor(selectedSlot.tour_slug).dot}`} />
              <div className="text-lg font-semibold text-dark">
                {formatTime(selectedSlot.departure_time)} — {selectedSlot.tour_name}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Noch {selectedSlot.remaining} Pl&auml;tze frei
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm text-amber-800">
            Wird eingetragen als: <strong>Sammelverkauf {staffName}</strong>
          </div>

          {/* Counter: Adults */}
          <CounterRow
            label="Anzahl Erwachsene"
            sublabel="verkauft"
            value={bulkAdults}
            onDecrement={() => setBulkAdults(Math.max(0, bulkAdults - 1))}
            onIncrement={() => setBulkAdults(bulkAdults + 1)}
          />

          {/* Counter: Children */}
          <CounterRow
            label="Anzahl Kinder"
            sublabel="verkauft"
            value={bulkChildren}
            onDecrement={() => setBulkChildren(Math.max(0, bulkChildren - 1))}
            onIncrement={() => setBulkChildren(bulkChildren + 1)}
          />

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Betrag Bar (&euro;)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={barAmount}
                onChange={(e) => setBarAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Betrag Karte (&euro;)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Notiz (optional)
            </label>
            <input
              type="text"
              value={bulkNote}
              onChange={(e) => setBulkNote(e.target.value)}
              placeholder="z.B. Nachmittagstour, Gruppe 12 Personen"
              className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Total */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-dark">Gesamt</span>
              <span className="text-2xl font-bold text-primary">
                {((parseFloat(barAmount) || 0) + (parseFloat(cardAmount) || 0)).toFixed(2)} &euro;
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleSellBulk}
            disabled={submitting || (bulkAdults === 0 && bulkChildren === 0)}
            className="w-full bg-primary text-white font-bold py-5 rounded-xl text-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Wird eingetragen...' : 'Eintragen'}
          </button>
        </div>
      )}
    </div>
  );
}

function CounterRow({
  label,
  sublabel,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  sublabel: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-dark">{label}</div>
          <div className="text-sm text-gray-500">{sublabel}</div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onDecrement}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
          >
            &minus;
          </button>
          <span className="text-2xl font-bold text-dark w-8 text-center">
            {value}
          </span>
          <button
            onClick={onIncrement}
            className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceEmailSection({ bookingReference }: { bookingReference: string }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim() || !email.includes('@')) return;
    setSending(true);
    try {
      // Update the booking with the customer email, then send invoice link
      const res = await fetch('/api/dashboard/send-invoice-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_reference: bookingReference, email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
      }
    } catch {
      // Silently fail — not critical
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
        <p className="text-green-700 text-sm font-medium">✓ Rechnungslink an {email} gesendet</p>
      </div>
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full text-sm text-dark/50 py-3 mb-2 hover:text-dark transition-colors"
      >
        🧾 Rechnung benötigt?
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
      <p className="text-sm text-dark/60">E-Mail für Rechnungslink:</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="kunde@email.de"
        className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
        autoFocus
      />
      <button
        onClick={handleSend}
        disabled={sending || !email.includes('@')}
        className="w-full bg-dark text-white font-semibold py-3 rounded-lg text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
      >
        {sending ? 'Sende...' : 'Rechnungslink senden'}
      </button>
    </div>
  );
}
