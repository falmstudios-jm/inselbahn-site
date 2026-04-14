'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface PassengerBooking {
  id: string;
  customer_name: string;
  adults: number;
  children: number;
  children_free: number;
  ghost_seats: number | null;
  payment_method: string | null;
  booking_reference: string;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
}

interface NextDeparture {
  departure_id: string;
  departure_time: string;
  tour_name: string;
  tour_slug: string;
  max_capacity: number;
  online_capacity: number | null;
  price_adult: number;
  price_child: number;
  total_adults: number;
  total_children: number;
  total_children_free: number;
  total_seats: number;
  remaining: number;
  passengers: PassengerBooking[];
}

export default function PreparePage() {
  const [departure, setDeparture] = useState<NextDeparture | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [departed, setDeparted] = useState(false);
  const [noMore, setNoMore] = useState(false);
  const [isTomorrow, setIsTomorrow] = useState(false);
  const [tomorrowDate, setTomorrowDate] = useState('');

  // Check-in state
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
  const toggleCheckIn = (bookingId: string) => {
    setCheckedIn((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) next.delete(bookingId);
      else next.add(bookingId);
      return next;
    });
  };

  // Quick sell state
  const [sellAdults, setSellAdults] = useState(0);
  const [sellChildren, setSellChildren] = useState(0);
  const [sellPayment, setSellPayment] = useState<'cash' | 'sumup'>('cash');
  const [sellSubmitting, setSellSubmitting] = useState(false);
  const [sellConfirmation, setSellConfirmation] = useState<string | null>(null);
  const [sellError, setSellError] = useState('');
  const [holdId, setHoldId] = useState<string | null>(null);

  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reserve seats when cart changes (debounced 300ms)
  const updateHold = useCallback((adults: number, children: number) => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(async () => {
      if (!departure) return;
      const bookingDate = tomorrowDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
      try {
        const res = await fetch('/api/dashboard/hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            departure_id: departure.departure_id,
            booking_date: bookingDate,
            adults, children,
            hold_id: holdId,
          }),
        });
        const data = await res.json();
        if (data.hold_id !== undefined) setHoldId(data.hold_id);
      } catch { /* silent */ }
    }, 300);
  }, [departure, tomorrowDate, holdId]);

  // Release hold on unmount
  useEffect(() => {
    return () => {
      if (holdId) {
        fetch(`/api/dashboard/hold?id=${holdId}`, { method: 'DELETE' }).catch(() => {});
      }
    };
  }, [holdId]);

  // Live clock - update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNextDeparture = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/next-departure', { cache: 'no-store' });
      const data = await res.json();
      if (data.next_departure) {
        setDeparture(data.next_departure);
        setIsTomorrow(!!data.is_tomorrow);
        setTomorrowDate(data.date || '');
        setNoMore(false);
      } else {
        setDeparture(null);
        setIsTomorrow(false);
        setNoMore(true);
      }
    } catch {
      console.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 10 seconds
  useEffect(() => {
    loadNextDeparture();
    const interval = setInterval(loadNextDeparture, 10000);
    return () => clearInterval(interval);
  }, [loadNextDeparture]);

  // Berlin time formatting
  const berlinTime = currentTime.toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Calculate countdown
  const getCountdown = (): { minutes: number; seconds: number; totalSeconds: number } | null => {
    if (!departure) return null;
    const nowBerlin = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const [h, m] = departure.departure_time.split(':').map(Number);
    const depDate = new Date(nowBerlin);
    depDate.setHours(h, m, 0, 0);
    const diff = depDate.getTime() - nowBerlin.getTime();
    if (diff <= 0) return { minutes: 0, seconds: 0, totalSeconds: 0 };
    const totalSeconds = Math.floor(diff / 1000);
    return {
      minutes: Math.floor(totalSeconds / 60),
      seconds: totalSeconds % 60,
      totalSeconds,
    };
  };

  const countdown = getCountdown();

  const getTourColors = (slug: string) => {
    if (slug.includes('unterland')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500' };
    return { bg: 'bg-blue-50', text: 'text-[#1B2A4A]', border: 'border-blue-300', dot: 'bg-[#1B2A4A]' };
  };

  const formatDepartureTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const getPaymentIcon = (method: string | null) => {
    switch (method) {
      case 'cash': return '\ud83d\udcb5';
      case 'sumup': return '\ud83d\udcb3';
      case 'stripe': return '\ud83d\udcb3';
      case 'manual_entry': return '\ud83d\udcb5';
      default: return '\ud83d\udcb3';
    }
  };

  const handleQuickSell = async () => {
    if (!departure || sellSubmitting) return;
    if (sellAdults === 0 && sellChildren === 0) return;

    setSellSubmitting(true);
    setSellError('');

    // Use the date from the API (could be today or tomorrow)
    const bookingDate = tomorrowDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

    try {
      const res = await fetch('/api/dashboard/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'individual',
          departure_id: departure.departure_id,
          booking_date: bookingDate,
          adults: sellAdults,
          children: sellChildren,
          children_free: 0,
          payment_method: sellPayment,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Release the hold (the sell API created the real booking)
        if (holdId) {
          fetch(`/api/dashboard/hold?id=${holdId}`, { method: 'DELETE' }).catch(() => {});
          setHoldId(null);
        }
        setSellConfirmation(data.booking_reference);
        // Reset after 3 seconds
        if (confirmTimer.current) clearTimeout(confirmTimer.current);
        confirmTimer.current = setTimeout(() => {
          setSellConfirmation(null);
          setSellAdults(0);
          setSellChildren(0);
        }, 3000);
        // Reload data
        loadNextDeparture();
      } else {
        setSellError(data.error || 'Fehler beim Erstellen');
      }
    } catch {
      setSellError('Verbindungsfehler');
    } finally {
      setSellSubmitting(false);
    }
  };

  const handleDepart = () => {
    setDeparted(true);
    // After 3 seconds, move to next departure
    setTimeout(() => {
      setDeparted(false);
      loadNextDeparture();
    }, 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Laden...</div>
      </div>
    );
  }

  // Departed confirmation
  if (departed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="text-6xl mb-4">{'\ud83d\ude80'}</div>
        <div className="text-2xl font-bold text-dark mb-2">Tour gestartet!</div>
        <div className="text-gray-500">Gute Fahrt!</div>
      </div>
    );
  }

  // No more departures today
  if (noMore || !departure) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            N&auml;chste Tour
          </div>
          <div className="text-lg font-mono font-bold text-dark">{berlinTime}</div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          {isTomorrow && departure ? (
            <>
              <div className="text-4xl mb-4">🌅</div>
              <div className="text-xl font-bold text-dark mb-2">Feierabend für heute!</div>
              <div className="text-gray-500 text-center mb-6">Alle Touren für heute sind abgeschlossen.</div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center w-full max-w-sm">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Erste Tour morgen</div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(tomorrowDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-2 ${departure.tour_slug?.includes('unterland') ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-[#1B2A4A]'}`}>
                  {departure.tour_name}
                </div>
                <div className="text-4xl font-bold text-dark">
                  {departure.departure_time?.slice(0, 5)} Uhr
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl mb-4">✅</div>
              <div className="text-xl font-bold text-dark mb-2">Keine weiteren Touren</div>
              <div className="text-gray-500 text-center">Derzeit keine geplanten Abfahrten.</div>
            </>
          )}
        </div>
      </div>
    );
  }

  const colors = getTourColors(departure.tour_slug);
  const capacityPct = departure.max_capacity > 0
    ? (departure.total_seats / departure.max_capacity) * 100
    : 0;

  const isUrgent = countdown !== null && countdown.totalSeconds < 900; // < 15 min
  const isCritical = countdown !== null && countdown.totalSeconds < 300; // < 5 min

  return (
    <div className="p-4 max-w-lg mx-auto pb-48">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          N&auml;chste Tour
        </div>
        <div className="text-lg font-mono font-bold text-dark">{berlinTime}</div>
      </div>

      {/* Next Departure Card */}
      <div className={`rounded-2xl p-5 shadow-sm border-2 mb-4 ${colors.bg} ${colors.border}`}>
        {/* Tour name badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${colors.bg} ${colors.text}`}>
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          {departure.tour_name}
        </div>

        {/* Departure time - HUGE */}
        <div className="text-7xl font-bold text-dark tracking-tight mb-2">
          {formatDepartureTime(departure.departure_time)}
        </div>

        {/* Countdown */}
        {countdown && (
          <div className={`text-2xl font-bold mb-4 ${
            isCritical
              ? 'text-[#F24444] animate-pulse'
              : isUrgent
                ? 'text-[#F24444]'
                : 'text-gray-600'
          }`}>
            {isCritical
              ? 'JETZT VORBEREITEN!'
              : `Abfahrt in ${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`
            }
          </div>
        )}

        {/* Passenger summary */}
        <div className="text-base text-gray-700 mb-3">
          {departure.total_adults > 0 && `${departure.total_adults} Erwachsene`}
          {departure.total_children > 0 && `, ${departure.total_children} Kinder`}
          {departure.total_children_free > 0 && `, ${departure.total_children_free} Kind (0-5)`}
          {departure.total_adults === 0 && departure.total_children === 0 && departure.total_children_free === 0 && 'Keine Buchungen'}
        </div>

        {/* Capacity bar */}
        <div className="mb-1">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-semibold text-dark">
              {departure.total_seats} / {departure.max_capacity} Pl&auml;tze
            </span>
            <span className={`font-bold ${
              departure.remaining === 0 ? 'text-red-600' : departure.remaining <= 3 ? 'text-amber-600' : 'text-green-600'
            }`}>
              {departure.remaining === 0 ? 'VOLL' : `${departure.remaining} frei`}
            </span>
          </div>
          <div className="h-3 bg-white/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                capacityPct > 80 ? 'bg-red-500' : capacityPct > 50 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, capacityPct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Passenger List */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Passagiere ({departure.passengers.length})
          {departure.passengers.filter(p => p.customer_name !== 'BLOCKIERT').length > 0 && (
            <span className="ml-2 text-green-600">
              ✓ {checkedIn.size}/{departure.passengers.filter(p => p.customer_name !== 'BLOCKIERT').length} anwesend
            </span>
          )}
        </h2>

        {departure.passengers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            Noch keine Buchungen
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {departure.passengers.map((p) => {
              const isBlocked = p.customer_name === 'BLOCKIERT';

              return (
                <div
                  key={p.id}
                  className={`px-4 py-3 ${isBlocked ? 'bg-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Check-in toggle */}
                    {!isBlocked && (
                      <button
                        onClick={() => toggleCheckIn(p.id)}
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${
                          checkedIn.has(p.id)
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {checkedIn.has(p.id) && (
                          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      {isBlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-400 text-lg">GESPERRT</span>
                          <span className="text-xs text-gray-400">
                            {p.adults} {p.adults === 1 ? 'Platz' : 'Pl\u00e4tze'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className={`font-bold text-lg truncate ${checkedIn.has(p.id) ? 'text-green-700' : 'text-dark'}`}>
                            {p.customer_name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-mono text-xs text-gray-400">{p.booking_reference}</span>
                            <span className="text-gray-300">|</span>
                            <span>
                              {p.adults > 0 && `${p.adults} Erw.`}
                              {p.children > 0 && ` + ${p.children} Kind`}
                              {p.children_free > 0 && ` + ${p.children_free} frei`}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    {!isBlocked && (
                      <div className="text-2xl shrink-0 ml-2">
                        {p.payment_method === 'cash' || p.payment_method === 'manual_entry'
                          ? getPaymentIcon('cash')
                          : p.notes?.toLowerCase().includes('gutschein')
                            ? '\ud83c\udfab'
                            : getPaymentIcon(p.payment_method)
                        }
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Sell Section */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Schnellverkauf
        </h2>

        {sellConfirmation ? (
          <div className="text-center py-4">
            <div className="text-green-600 font-bold text-lg mb-1">{'\u2705'} Ticket erstellt!</div>
            <div className="font-mono text-sm text-gray-500">{sellConfirmation}</div>
          </div>
        ) : (
          <>
            {/* Counters */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-dark">Erwachsene</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { const v = Math.max(0, sellAdults - 1); setSellAdults(v); updateHold(v, sellChildren); }}
                  className="w-[60px] h-[60px] rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-dark active:bg-gray-200"
                >
                  &minus;
                </button>
                <span className="text-3xl font-bold text-dark w-10 text-center">
                  {sellAdults}
                </span>
                <button
                  onClick={() => { const v = sellAdults + 1; setSellAdults(v); updateHold(v, sellChildren); }}
                  className="w-[60px] h-[60px] rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-dark active:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-dark">Kinder</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { const v = Math.max(0, sellChildren - 1); setSellChildren(v); updateHold(sellAdults, v); }}
                  className="w-[60px] h-[60px] rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-dark active:bg-gray-200"
                >
                  &minus;
                </button>
                <span className="text-3xl font-bold text-dark w-10 text-center">
                  {sellChildren}
                </span>
                <button
                  onClick={() => { const v = sellChildren + 1; setSellChildren(v); updateHold(sellAdults, v); }}
                  className="w-[60px] h-[60px] rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-dark active:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Payment toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSellPayment('cash')}
                className={`py-3 rounded-xl font-semibold text-base transition-colors ${
                  sellPayment === 'cash'
                    ? 'bg-[#F24444] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setSellPayment('sumup')}
                className={`py-3 rounded-xl font-semibold text-base transition-colors ${
                  sellPayment === 'sumup'
                    ? 'bg-[#F24444] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Karte
              </button>
            </div>

            {/* Remaining capacity */}
            <div className="text-center text-sm text-gray-500 mb-3">
              {departure.remaining} Pl&auml;tze frei
            </div>

            {sellError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg mb-3">
                {sellError}
              </div>
            )}

            {/* Sell button */}
            <button
              onClick={handleQuickSell}
              disabled={sellSubmitting || (sellAdults === 0 && sellChildren === 0)}
              className="w-full bg-dark text-white font-bold py-4 rounded-xl text-xl disabled:opacity-30 active:scale-[0.98] transition-transform"
            >
              {sellSubmitting ? 'Erstelle...' : '\ud83c\udfab TICKET'}
            </button>
          </>
        )}
      </div>

      {/* ABFAHRT Button - fixed at bottom */}
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-40">
        <button
          onClick={handleDepart}
          className="w-full max-w-lg mx-auto block bg-[#F24444] text-white font-black py-5 rounded-2xl text-2xl active:scale-[0.97] transition-transform shadow-lg shadow-red-500/30"
        >
          {'\ud83d\ude80'} ABFAHRT
        </button>
      </div>
    </div>
  );
}
