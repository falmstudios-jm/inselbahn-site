'use client';

import { useState, useEffect, useCallback } from 'react';

interface Passenger {
  id: string;
  customer_name: string;
  adults: number;
  children: number;
  children_free: number;
  payment_method: string | null;
  booking_reference: string;
  status: string;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  gift_card_id: string | null;
  notes: string | null;
}

interface DepartureSlot {
  departure_id: string;
  departure_time: string;
  tour_name: string;
  tour_slug: string;
  max_capacity: number;
  booked: number;
  remaining: number;
  online_count: number;
  vor_ort_count: number;
}

interface DailyRevenue {
  total_revenue: number;
  total_passengers: number;
  by_payment_method: { method: string; revenue: number; count: number }[];
}

interface RefundState {
  bookingId: string;
  amount: string;
  reason: string;
  customReason: string;
}

interface BlockState {
  departureId: string;
  seats: number;
  reason: string;
}

export default function DeparturesPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  });
  const [departures, setDepartures] = useState<DepartureSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue | null>(null);

  // Refund state
  const [refundState, setRefundState] = useState<RefundState | null>(null);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');

  // Block state
  const [blockState, setBlockState] = useState<BlockState | null>(null);
  const [blockSubmitting, setBlockSubmitting] = useState(false);
  const [blockError, setBlockError] = useState('');

  // Unblock confirmation
  const [unblockId, setUnblockId] = useState<string | null>(null);
  const [unblockSubmitting, setUnblockSubmitting] = useState(false);

  const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  const isToday = selectedDate === todayISO;

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const loadDepartures = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/departures?date=${selectedDate}`);
      const data = await res.json();
      setDepartures(data.departures || []);
    } catch {
      console.error('Fehler beim Laden der Abfahrten');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch(`/api/dashboard/revenue?date=${selectedDate}`);
      const data = await res.json();
      setDailyRevenue(data);
    } catch {
      // silent
    }
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    setExpandedId(null);
    setPassengers([]);
    loadDepartures();
    loadRevenue();
    const interval = setInterval(() => {
      loadDepartures();
      loadRevenue();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadDepartures, loadRevenue]);

  const loadPassengers = async (departureId: string) => {
    if (expandedId === departureId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(departureId);
    setLoadingPassengers(true);

    try {
      const res = await fetch(
        `/api/dashboard/passengers?departure_id=${departureId}&date=${selectedDate}`
      );
      const data = await res.json();
      setPassengers(data.passengers || []);
    } catch {
      setPassengers([]);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const toggleCheckIn = (bookingId: string) => {
    setCheckedIn((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  };

  const getCapacityPercent = (dep: DepartureSlot) => {
    if (dep.max_capacity === 0) return 0;
    return (dep.booked / dep.max_capacity) * 100;
  };

  const getCapacityColor = (dep: DepartureSlot) => {
    if (!isToday) {
      const pct = getCapacityPercent(dep);
      if (pct > 80) return 'bg-red-500';
      if (pct > 50) return 'bg-amber-500';
      return 'bg-green-500';
    }

    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const now = new Date(nowBerlin);
    const [h, m] = dep.departure_time.split(':').map(Number);
    const depDate = new Date(now);
    depDate.setHours(h, m, 0, 0);

    if (depDate < now) return 'bg-gray-300';

    const pct = getCapacityPercent(dep);
    if (pct > 80) return 'bg-red-500';
    if (pct > 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getBarColor = (dep: DepartureSlot) => {
    const pct = getCapacityPercent(dep);
    if (pct > 80) return 'bg-red-500';
    if (pct > 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const isPast = (time: string) => {
    if (!isToday) return false;
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const now = new Date(nowBerlin);
    const [h, m] = time.split(':').map(Number);
    const depDate = new Date(now);
    depDate.setHours(h, m, 0, 0);
    return depDate < now;
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const paymentLabel = (method: string | null) => {
    switch (method) {
      case 'cash': return 'Bar';
      case 'sumup': return 'SumUp';
      case 'stripe': return 'Online';
      case 'manual_entry': return 'Manuell';
      default: return 'Online';
    }
  };

  const paymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Bar';
      case 'sumup': return 'Karte/SumUp';
      case 'stripe': return 'Online';
      case 'manual_entry': return 'Manuell';
      default: return 'Online';
    }
  };

  const getTourColor = (slug: string) => {
    if (slug.includes('unterland')) return { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500', text: 'text-amber-700' };
    return { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'bg-[#1B2A4A]', text: 'text-[#1B2A4A]' };
  };

  // Refund handlers
  const openRefund = (p: Passenger) => {
    setRefundState({
      bookingId: p.id,
      amount: String(p.total_amount),
      reason: 'Zu gro\u00df f\u00fcr Fahrzeug',
      customReason: '',
    });
    setRefundError('');
  };

  const handleRefund = async () => {
    if (!refundState) return;
    setRefundSubmitting(true);
    setRefundError('');

    const reason =
      refundState.reason === 'Sonstiges'
        ? refundState.customReason || 'Sonstiges'
        : refundState.reason;

    try {
      const res = await fetch('/api/dashboard/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: refundState.bookingId,
          amount: parseFloat(refundState.amount) || 0,
          reason,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update passenger in local state
        setPassengers((prev) =>
          prev.map((p) =>
            p.id === refundState.bookingId
              ? { ...p, status: data.status }
              : p
          )
        );
        setRefundState(null);
        loadDepartures();
        loadRevenue();
      } else {
        setRefundError(data.error || 'Fehler bei der Erstattung');
      }
    } catch {
      setRefundError('Verbindungsfehler');
    } finally {
      setRefundSubmitting(false);
    }
  };

  // Block handlers
  const openBlock = (departureId: string) => {
    setBlockState({
      departureId,
      seats: 1,
      reason: 'Reserviert',
    });
    setBlockError('');
  };

  const handleBlock = async () => {
    if (!blockState) return;
    setBlockSubmitting(true);
    setBlockError('');

    try {
      const res = await fetch('/api/dashboard/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'block',
          departure_id: blockState.departureId,
          booking_date: selectedDate,
          adults: blockState.seats,
          customer_name: 'BLOCKIERT',
          payment_method: 'manual_entry',
          total_amount: 0,
          notes: blockState.reason || 'Reserviert',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setBlockState(null);
        loadDepartures();
        loadRevenue();
        // Reload passengers if expanded
        if (expandedId === blockState.departureId) {
          const pRes = await fetch(
            `/api/dashboard/passengers?departure_id=${blockState.departureId}&date=${selectedDate}`
          );
          const pData = await pRes.json();
          setPassengers(pData.passengers || []);
        }
      } else {
        setBlockError(data.error || 'Fehler beim Blockieren');
      }
    } catch {
      setBlockError('Verbindungsfehler');
    } finally {
      setBlockSubmitting(false);
    }
  };

  // Unblock handler (delete the blocked booking)
  const handleUnblock = async (bookingId: string) => {
    setUnblockSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: 0,
          reason: 'Blockierung aufgehoben',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPassengers((prev) => prev.filter((p) => p.id !== bookingId));
        setUnblockId(null);
        loadDepartures();
        loadRevenue();
      }
    } catch {
      // silent
    } finally {
      setUnblockSubmitting(false);
    }
  };

  // Suppress unused var warning
  void getCapacityColor;

  // Tour filter
  const [tourFilter, setTourFilter] = useState<'all' | 'premium' | 'unterland'>('all');
  const filteredDepartures = departures.filter((d) => {
    if (tourFilter === 'all') return true;
    if (tourFilter === 'premium') return d.tour_slug.includes('premium');
    return d.tour_slug.includes('unterland');
  });

  // Total passengers today
  const totalPassengers = filteredDepartures.reduce((sum, d) => sum + d.booked, 0);
  const totalOnline = filteredDepartures.reduce((sum, d) => sum + d.online_count, 0);
  const totalVorOrt = filteredDepartures.reduce((sum, d) => sum + d.vor_ort_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Date selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeDate(-1)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 active:bg-gray-50"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <button
            onClick={() => setSelectedDate(todayISO)}
            className="text-center"
          >
            <div className="text-lg font-bold text-dark">
              {isToday ? 'Heute' : formatDateLabel(selectedDate)}
            </div>
            {isToday && (
              <div className="text-xs text-gray-500">{formatDateLabel(selectedDate)}</div>
            )}
          </button>
        </div>

        <button
          onClick={() => changeDate(1)}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-200 active:bg-gray-50"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Quick date jump */}
      {!isToday && (
        <button
          onClick={() => setSelectedDate(todayISO)}
          className="w-full mb-4 py-2 text-sm font-medium text-primary bg-primary/5 rounded-lg border border-primary/20 active:bg-primary/10"
        >
          Zur&uuml;ck zu heute
        </button>
      )}

      {/* Tour filter toggle */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {([['all', 'Alles'], ['premium', 'Premium'], ['unterland', 'Unterland']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTourFilter(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              tourFilter === key
                ? 'bg-white text-dark shadow-sm'
                : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Departure cards */}
      <div className="space-y-3">
        {filteredDepartures.map((dep) => {
          const colors = getTourColor(dep.tour_slug);
          const pct = getCapacityPercent(dep);
          const freeSpots = dep.remaining;

          return (
            <div key={dep.departure_id}>
              <button
                onClick={() => loadPassengers(dep.departure_id)}
                className={`w-full rounded-xl p-4 shadow-sm border transition-transform active:scale-[0.99] ${
                  isPast(dep.departure_time)
                    ? 'bg-gray-50 border-gray-200 opacity-60'
                    : `bg-white ${colors.border}`
                }`}
              >
                {/* Tour badge + time */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colors.accent}`} />
                    <span className="text-lg font-bold text-dark">
                      {formatTime(dep.departure_time)}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {dep.tour_name}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === dep.departure_id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Capacity bar */}
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(dep)}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Split info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">
                      <span className="font-semibold text-dark">{dep.booked}</span>
                      <span className="text-gray-400"> / {dep.max_capacity}</span>
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-blue-600 text-xs">Online {dep.online_count}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-amber-600 text-xs">Vor Ort {dep.vor_ort_count}</span>
                  </div>
                  <span className={`font-semibold text-sm ${
                    freeSpots === 0 ? 'text-red-600' : freeSpots <= 3 ? 'text-amber-600' : 'text-green-600'
                  }`}>
                    {freeSpots === 0 ? 'VOLL' : `${freeSpots} frei`}
                  </span>
                </div>
              </button>

              {/* Expanded section: Passenger list + Block button */}
              {expandedId === dep.departure_id && (
                <div className="mt-1">
                  {/* Passenger list */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                    {loadingPassengers ? (
                      <div className="p-4 text-center text-gray-400">
                        Laden...
                      </div>
                    ) : passengers.length === 0 ? (
                      <div className="p-4 text-center text-gray-400">
                        Keine Buchungen
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {passengers.map((p) => {
                          const isBlocked = p.customer_name === 'BLOCKIERT';
                          const isRefunded = p.status === 'refunded' || p.status === 'partial_refund';

                          return (
                            <div
                              key={p.id}
                              className={`p-3 flex items-center gap-3 ${
                                isBlocked ? 'bg-gray-200' : isRefunded ? 'bg-red-50' : ''
                              }`}
                            >
                              {/* Check-in toggle (not for blocked/refunded) */}
                              {!isBlocked && !isRefunded ? (
                                <button
                                  onClick={() => toggleCheckIn(p.id)}
                                  className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                                    checkedIn.has(p.id)
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {checkedIn.has(p.id) && (
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                              ) : (
                                <div className="w-8 h-8 shrink-0" />
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-dark truncate flex items-center gap-2">
                                  {isBlocked ? (
                                    <span className="text-gray-500">BLOCKIERT</span>
                                  ) : (
                                    p.customer_name
                                  )}
                                  {isRefunded && (
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                                      Erstattet
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                                  {isBlocked ? (
                                    <span className="text-gray-400">
                                      {p.adults} {p.adults === 1 ? 'Platz' : 'Pl\u00e4tze'}
                                      {p.notes ? ` \u2014 ${p.notes}` : ''}
                                    </span>
                                  ) : (
                                    <>
                                      <span>
                                        {p.adults}E{p.children > 0 ? ` + ${p.children}K` : ''}
                                        {p.children_free > 0 ? ` + ${p.children_free}frei` : ''}
                                      </span>
                                      <span className="text-gray-300">|</span>
                                      <span>{paymentLabel(p.payment_method)}</span>
                                      <span className="text-gray-300">|</span>
                                      <span className="font-mono">{p.booking_reference}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Action buttons */}
                              {isBlocked ? (
                                unblockId === p.id ? (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleUnblock(p.id)}
                                      disabled={unblockSubmitting}
                                      className="text-xs font-semibold px-2 py-1 rounded bg-red-500 text-white disabled:opacity-50"
                                    >
                                      {unblockSubmitting ? '...' : 'Ja'}
                                    </button>
                                    <button
                                      onClick={() => setUnblockId(null)}
                                      className="text-xs font-semibold px-2 py-1 rounded bg-gray-300 text-gray-700"
                                    >
                                      Nein
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setUnblockId(p.id)}
                                    className="text-xs font-semibold px-2 py-1.5 rounded bg-gray-300 text-gray-700 shrink-0"
                                  >
                                    Freigeben
                                  </button>
                                )
                              ) : !isRefunded ? (
                                <button
                                  onClick={() => openRefund(p)}
                                  className="text-xs font-semibold px-2 py-1.5 rounded bg-red-100 text-red-700 shrink-0 active:bg-red-200"
                                >
                                  Erstatten
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Block seats button */}
                  {blockState?.departureId === dep.departure_id ? (
                    <div className="mt-2 bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-sm font-semibold text-dark mb-3">Pl&auml;tze blockieren</div>

                      {/* Seat counter */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Anzahl Pl&auml;tze</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setBlockState((s) => s ? { ...s, seats: Math.max(1, s.seats - 1) } : s)}
                            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-dark active:bg-gray-200"
                          >
                            &minus;
                          </button>
                          <span className="text-xl font-bold text-dark w-6 text-center">{blockState.seats}</span>
                          <button
                            onClick={() => setBlockState((s) => s ? { ...s, seats: s.seats + 1 } : s)}
                            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-dark active:bg-gray-200"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Reason */}
                      <input
                        type="text"
                        value={blockState.reason}
                        onChange={(e) => setBlockState((s) => s ? { ...s, reason: e.target.value } : s)}
                        placeholder="Grund (optional)"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />

                      {blockError && (
                        <div className="text-red-600 text-xs text-center mb-2">{blockError}</div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handleBlock}
                          disabled={blockSubmitting}
                          className="flex-1 bg-gray-800 text-white font-semibold py-2.5 rounded-lg text-sm disabled:opacity-50 active:scale-[0.98]"
                        >
                          {blockSubmitting ? 'Blockiere...' : 'Blockieren'}
                        </button>
                        <button
                          onClick={() => setBlockState(null)}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openBlock(dep.departure_id)}
                      className="mt-2 w-full py-2.5 text-sm font-medium text-gray-600 bg-white rounded-xl border border-gray-200 active:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pl&auml;tze blockieren
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {departures.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Keine Abfahrten f&uuml;r diesen Tag
        </div>
      )}

      {/* Daily summary */}
      {departures.length > 0 && (
        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Tages&uuml;bersicht
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{totalPassengers}</div>
              <div className="text-xs text-gray-500">Fahrg&auml;ste</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalOnline}</div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{totalVorOrt}</div>
              <div className="text-xs text-gray-500">Vor Ort</div>
            </div>
          </div>

          {dailyRevenue && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Gesamtumsatz</span>
                  <span className="text-xl font-bold text-primary">
                    {dailyRevenue.total_revenue.toFixed(2)} &euro;
                  </span>
                </div>
                {dailyRevenue.by_payment_method.length > 0 && (
                  <div className="space-y-1">
                    {dailyRevenue.by_payment_method.map((pm) => (
                      <div key={pm.method} className="flex items-center justify-between text-xs text-gray-500">
                        <span>{paymentMethodLabel(pm.method)}</span>
                        <span className="font-medium text-dark">{pm.revenue.toFixed(2)} &euro;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Refund Modal */}
      {refundState && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-dark">Erstattung</h3>
              <button
                onClick={() => setRefundState(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Erstattungsbetrag (&euro;)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={refundState.amount}
                onChange={(e) =>
                  setRefundState((s) => s ? { ...s, amount: e.target.value } : s)
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            {/* Reason dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Grund
              </label>
              <select
                value={refundState.reason}
                onChange={(e) =>
                  setRefundState((s) => s ? { ...s, reason: e.target.value } : s)
                }
                className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                <option value="Zu gro&szlig; f&uuml;r Fahrzeug">Zu gro&szlig; f&uuml;r Fahrzeug</option>
                <option value="Wetter">Wetter</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>

            {/* Custom reason */}
            {refundState.reason === 'Sonstiges' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Grund beschreiben
                </label>
                <input
                  type="text"
                  value={refundState.customReason}
                  onChange={(e) =>
                    setRefundState((s) => s ? { ...s, customReason: e.target.value } : s)
                  }
                  placeholder="Grund eingeben..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
            )}

            {refundError && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mb-4">
                {refundError}
              </div>
            )}

            <button
              onClick={handleRefund}
              disabled={refundSubmitting || !refundState.amount || parseFloat(refundState.amount) <= 0}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {refundSubmitting ? 'Erstatte...' : 'Erstatten'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
