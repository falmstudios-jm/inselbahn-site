'use client';

import { useState, useEffect, useCallback } from 'react';

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

export default function SellPage() {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [childrenFree, setChildrenFree] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'sumup'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    total: number;
  } | null>(null);
  const [error, setError] = useState('');

  const loadSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/departures?include_prices=1');
      const data = await res.json();
      setSlots(data.departures || []);
    } catch {
      console.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const totalPrice = selectedSlot
    ? adults * selectedSlot.price_adult + children * selectedSlot.price_child
    : 0;

  const handleSell = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');

    const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

    try {
      const res = await fetch('/api/dashboard/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departure_id: selectedSlot.departure_id,
          booking_date: todayISO,
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

  const resetForm = () => {
    setSelectedSlot(null);
    setAdults(1);
    setChildren(0);
    setChildrenFree(0);
    setPaymentMethod('cash');
    setCustomerName('');
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

          <h2 className="text-xl font-bold text-dark mb-2">Ticket erstellt!</h2>

          <div className="text-3xl font-mono font-bold text-primary mb-2">
            {confirmation.reference}
          </div>

          <div className="text-2xl font-bold text-dark mb-6">
            {confirmation.total.toFixed(2)} &euro;
          </div>

          <button
            onClick={resetForm}
            className="w-full bg-primary text-white font-semibold py-4 rounded-lg text-lg active:scale-[0.98] transition-transform"
          >
            Neues Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-dark mb-4">Ticket verkaufen</h1>

      {/* Step 1: Select departure */}
      {!selectedSlot ? (
        <div>
          <p className="text-sm text-gray-500 mb-3">Abfahrt wählen:</p>
          <div className="space-y-2">
            {slots
              .filter((s) => {
                // Only show future departures with remaining capacity
                const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
                const now = new Date(nowBerlin);
                const [h, m] = s.departure_time.split(':').map(Number);
                const depDate = new Date(now);
                depDate.setHours(h, m, 0, 0);
                return depDate > now && s.remaining > 0;
              })
              .map((slot) => (
                <button
                  key={slot.departure_id}
                  onClick={() => setSelectedSlot(slot)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 active:scale-[0.98] transition-transform text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-semibold text-dark">
                        {formatTime(slot.departure_time)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {slot.tour_name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${slot.remaining <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                        {slot.remaining} frei
                      </div>
                      <div className="text-xs text-gray-400">
                        ab {slot.price_adult}&euro;
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {slots.filter((s) => {
              const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
              const now = new Date(nowBerlin);
              const [h, m] = s.departure_time.split(':').map(Number);
              const depDate = new Date(now);
              depDate.setHours(h, m, 0, 0);
              return depDate > now && s.remaining > 0;
            }).length === 0 && (
              <div className="text-center text-gray-400 py-12">
                Keine verfügbaren Abfahrten mehr heute
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Selected departure header */}
          <button
            onClick={() => setSelectedSlot(null)}
            className="text-sm text-gray-500 mb-4 flex items-center gap-1"
          >
            &larr; Andere Abfahrt wählen
          </button>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="text-lg font-semibold text-dark">
              {formatTime(selectedSlot.departure_time)} — {selectedSlot.tour_name}
            </div>
            <div className="text-sm text-gray-500">
              Noch {selectedSlot.remaining} Plätze frei
            </div>
          </div>

          {/* Customer name (optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name (optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="z.B. Müller"
              className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Adults */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-dark">Erwachsene</div>
                <div className="text-sm text-gray-500">{selectedSlot.price_adult}&euro; pro Person</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdults(Math.max(0, adults - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  &minus;
                </button>
                <span className="text-2xl font-bold text-dark w-8 text-center">
                  {adults}
                </span>
                <button
                  onClick={() => setAdults(adults + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Children (paid) */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-dark">Kinder</div>
                <div className="text-sm text-gray-500">{selectedSlot.price_child}&euro; pro Kind</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  &minus;
                </button>
                <span className="text-2xl font-bold text-dark w-8 text-center">
                  {children}
                </span>
                <button
                  onClick={() => setChildren(children + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Children (free) */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-dark">Kinder (kostenlos)</div>
                <div className="text-sm text-gray-500">0&euro;</div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setChildrenFree(Math.max(0, childrenFree - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  &minus;
                </button>
                <span className="text-2xl font-bold text-dark w-8 text-center">
                  {childrenFree}
                </span>
                <button
                  onClick={() => setChildrenFree(childrenFree + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-dark active:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

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
                SumUp
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
            onClick={handleSell}
            disabled={submitting || (adults === 0 && children === 0 && childrenFree === 0)}
            className="w-full bg-primary text-white font-bold py-5 rounded-xl text-xl disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {submitting ? 'Erstelle Ticket...' : 'Ticket erstellen'}
          </button>
        </div>
      )}
    </div>
  );
}
