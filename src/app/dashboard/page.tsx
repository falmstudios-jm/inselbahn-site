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
}

export default function DeparturesPage() {
  const [departures, setDepartures] = useState<DepartureSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  });

  const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

  const loadDepartures = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/departures');
      const data = await res.json();
      setDepartures(data.departures || []);
    } catch {
      console.error('Fehler beim Laden der Abfahrten');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartures();
    const interval = setInterval(loadDepartures, 30000);
    return () => clearInterval(interval);
  }, [loadDepartures]);

  const loadPassengers = async (departureId: string) => {
    if (expandedId === departureId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(departureId);
    setLoadingPassengers(true);

    try {
      const res = await fetch(
        `/api/dashboard/passengers?departure_id=${departureId}&date=${todayISO}`
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

  const getCapacityColor = (dep: DepartureSlot) => {
    const nowBerlin = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const now = new Date(nowBerlin);
    const [h, m] = dep.departure_time.split(':').map(Number);
    const depDate = new Date(now);
    depDate.setHours(h, m, 0, 0);

    if (depDate < now) return 'bg-gray-300';

    const pct = dep.booked / dep.max_capacity;
    if (pct > 0.9) return 'bg-red-500';
    if (pct > 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isPast = (time: string) => {
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
      default: return 'Online';
    }
  };

  // Group departures by tour
  const grouped = departures.reduce<Record<string, DepartureSlot[]>>((acc, dep) => {
    const key = dep.tour_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(dep);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Laden...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-dark mb-1">Heutige Fahrten</h1>
      <p className="text-sm text-gray-500 mb-4">{today}</p>

      {Object.entries(grouped).map(([tourName, deps]) => (
        <div key={tourName} className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {tourName}
          </h2>

          <div className="space-y-2">
            {deps.map((dep) => (
              <div key={dep.departure_id}>
                <button
                  onClick={() => loadPassengers(dep.departure_id)}
                  className={`w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 active:scale-[0.99] transition-transform ${
                    isPast(dep.departure_time) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Capacity bar */}
                    <div
                      className={`w-1.5 h-12 rounded-full ${getCapacityColor(dep)}`}
                    />

                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-dark">
                          {formatTime(dep.departure_time)}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            dep.remaining === 0
                              ? 'text-red-600'
                              : dep.remaining <= 3
                              ? 'text-yellow-600'
                              : 'text-dark'
                          }`}
                        >
                          {dep.booked} / {dep.max_capacity}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {dep.tour_name}
                        {dep.remaining === 0 && (
                          <span className="ml-2 text-red-600 font-medium">VOLL</span>
                        )}
                      </div>
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
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 ${
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
            ))}
          </div>
        </div>
      ))}

      {departures.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          Keine Abfahrten für heute
        </div>
      )}
    </div>
  );
}
