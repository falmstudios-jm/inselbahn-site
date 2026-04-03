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

  // Total passengers today
  const totalPassengers = departures.reduce((sum, d) => sum + d.booked, 0);
  const totalOnline = departures.reduce((sum, d) => sum + d.online_count, 0);
  const totalVorOrt = departures.reduce((sum, d) => sum + d.vor_ort_count, 0);

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
          Zurück zu heute
        </button>
      )}

      {/* Departure cards */}
      <div className="space-y-3">
        {departures.map((dep) => {
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

              {/* Passenger list */}
              {expandedId === dep.departure_id && (
                <div className="mt-1 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
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
                      {passengers.map((p) => (
                        <div
                          key={p.id}
                          className="p-3 flex items-center gap-3"
                        >
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

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-dark truncate">
                              {p.customer_name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                              <span>
                                {p.adults}E{p.children > 0 ? ` + ${p.children}K` : ''}
                                {p.children_free > 0 ? ` + ${p.children_free}frei` : ''}
                              </span>
                              <span className="text-gray-300">|</span>
                              <span>{paymentLabel(p.payment_method)}</span>
                              <span className="text-gray-300">|</span>
                              <span className="font-mono">{p.booking_reference}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
            Tagesübersicht
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-dark">{totalPassengers}</div>
              <div className="text-xs text-gray-500">Fahrgäste</div>
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
    </div>
  );
}
