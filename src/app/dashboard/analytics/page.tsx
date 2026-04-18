'use client';

import { useState, useEffect, useCallback } from 'react';

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface AnalyticsData {
  period: { start_date: string; end_date: string };
  summary: {
    total_revenue: number;
    total_bookings: number;
    total_passengers: number;
    avg_booking_value: number;
  };
  comparison: {
    prev_revenue: number;
    prev_bookings: number;
    prev_passengers: number;
    revenue_change: number | null;
  };
  revenue_by_tour: Record<string, { revenue: number; bookings: number }>;
  revenue_by_payment: {
    online: { count: number; revenue: number };
    bar_sumup: { count: number; revenue: number };
  };
  occupancy: {
    departure: string;
    booked: number;
    capacity: number;
    fillRate: number;
  }[];
  chat: {
    total_chats: number;
    success_rate: number;
    top_topics: { topic: string; count: number }[];
    recent: {
      created_at: string;
      status: string;
      message_count: number;
      topics: string[];
      user_questions: string | null;
      ai_answers: string | null;
    }[];
  };
  falmstudios: {
    online_bookings: number;
    online_passengers: number;
    fee_per_passenger: number;
    total_fee: number;
    next_billing_date: string;
  };
}

function getDateRange(range: DateRange): { start: string; end: string } {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  switch (range) {
    case 'today':
      return { start: today, end: today };
    case 'week': {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return {
        start: monday.toISOString().slice(0, 10),
        end: sunday.toISOString().slice(0, 10),
      };
    }
    case 'month': {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: firstDay.toISOString().slice(0, 10),
        end: lastDay.toISOString().slice(0, 10),
      };
    }
    default:
      return { start: today, end: today };
  }
}

function formatEuro(amount: number): string {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [staffList, setStaffList] = useState<
    { id: string; name: string; role: string }[]
  >([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check existing session
  useEffect(() => {
    fetch('/api/auth/pin', { method: 'GET' })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((d) => {
        if (d.role === 'admin') setAuthed(true);
      })
      .catch(() => {});
  }, []);

  // Load staff for login
  useEffect(() => {
    if (!authed) {
      fetch('/api/dashboard/staff')
        .then((r) => r.json())
        .then((d) => {
          const admins = (d.staff || []).filter(
            (s: { role: string }) => s.role === 'admin'
          );
          setStaffList(admins);
          if (admins.length > 0) setSelectedStaff(admins[0].id);
        })
        .catch(() => {});
    }
  }, [authed]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    const range =
      dateRange === 'custom'
        ? { start: customStart, end: customEnd }
        : getDateRange(dateRange);

    if (!range.start || !range.end) {
      setError('Bitte Start- und Enddatum angeben.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/analytics?start_date=${range.start}&end_date=${range.end}`
      );
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Fehler beim Laden.');
        return;
      }
      const d = await res.json();
      setData(d);
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setLoading(false);
    }
  }, [dateRange, customStart, customEnd]);

  useEffect(() => {
    if (authed) fetchAnalytics();
  }, [authed, dateRange, fetchAnalytics]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: selectedStaff, pin }),
      });
      const d = await res.json();
      if (!res.ok) {
        setAuthError(d.error || 'Anmeldung fehlgeschlagen');
        return;
      }
      if (d.role !== 'admin') {
        setAuthError('Nur Administratoren haben Zugriff.');
        return;
      }
      setAuthed(true);
    } catch {
      setAuthError('Verbindungsfehler');
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Login ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Admin-Zugang erforderlich
          </p>

          {staffList.length > 0 && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-center text-2xl tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {authError && (
            <p className="text-red-500 text-sm text-center mb-3">
              {authError}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={authLoading || !pin}
            className="w-full bg-primary text-white font-semibold rounded-lg py-3 hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {authLoading ? 'Wird geprüft...' : 'Anmelden'}
          </button>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Analytics Dashboard
        </h1>
        <p className="text-gray-500 mb-6">
          Inselbahn Helgoland — Übersicht und Statistiken
        </p>

        {/* Date range selector */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(
            [
              ['today', 'Heute'],
              ['week', 'Diese Woche'],
              ['month', 'Dieser Monat'],
              ['custom', 'Benutzerdefiniert'],
            ] as [DateRange, string][]
          ).map(([range, label]) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                dateRange === range
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={fetchAnalytics}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Laden
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Gesamtumsatz"
                value={formatEuro(data.summary.total_revenue)}
                change={data.comparison.revenue_change}
              />
              <StatCard
                label="Buchungen"
                value={String(data.summary.total_bookings)}
                prev={data.comparison.prev_bookings}
              />
              <StatCard
                label="Fahrgäste"
                value={String(data.summary.total_passengers)}
                prev={data.comparison.prev_passengers}
              />
              <StatCard
                label="Ø Buchungswert"
                value={formatEuro(data.summary.avg_booking_value)}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue by tour */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Umsatz nach Tour
                </h2>
                {Object.entries(data.revenue_by_tour).length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    Keine Daten vorhanden.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data.revenue_by_tour).map(
                      ([name, info]) => {
                        const pct =
                          data.summary.total_revenue > 0
                            ? (info.revenue / data.summary.total_revenue) * 100
                            : 0;
                        return (
                          <div key={name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">
                                {name}
                              </span>
                              <span className="text-gray-500">
                                {formatEuro(info.revenue)} ({info.bookings}{' '}
                                Buchungen)
                              </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Revenue by payment method */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Zahlungsmethode
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Online (Stripe)
                      </p>
                      <p className="text-xs text-blue-600">
                        {data.revenue_by_payment.online.count} Buchungen
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-800">
                      {formatEuro(data.revenue_by_payment.online.revenue)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        Bar / SumUp
                      </p>
                      <p className="text-xs text-amber-600">
                        {data.revenue_by_payment.bar_sumup.count} Buchungen
                      </p>
                    </div>
                    <p className="text-lg font-bold text-amber-800">
                      {formatEuro(data.revenue_by_payment.bar_sumup.revenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Occupancy */}
            {data.occupancy.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Auslastung nach Abfahrt
                </h2>
                <div className="space-y-3">
                  {data.occupancy
                    .sort((a, b) => a.departure.localeCompare(b.departure))
                    .map((occ) => (
                      <div key={occ.departure}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">
                            {occ.departure}
                          </span>
                          <span className="text-gray-500">
                            {occ.fillRate}% ({occ.booked} Fahrgäste, Kap.{' '}
                            {occ.capacity})
                          </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              occ.fillRate >= 80
                                ? 'bg-red-400'
                                : occ.fillRate >= 50
                                  ? 'bg-amber-400'
                                  : 'bg-green-400'
                            }`}
                            style={{
                              width: `${Math.min(100, occ.fillRate)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Chat insights */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Chat-Statistiken
                </h2>
                <div className="flex items-center gap-6 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {data.chat.total_chats}
                    </p>
                    <p className="text-xs text-gray-500">Gespräche</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {data.chat.success_rate}%
                    </p>
                    <p className="text-xs text-gray-500">Erfolgsrate</p>
                  </div>
                </div>
                {data.chat.top_topics.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Top-Themen
                    </p>
                    <div className="space-y-1.5">
                      {data.chat.top_topics.map((t) => (
                        <div
                          key={t.topic}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700">{t.topic}</span>
                          <span className="text-gray-400 text-xs font-mono">
                            {t.count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* falmstudios fee */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  falmstudios-Gebühr
                </h2>
                <table className="w-full text-sm mb-4">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">
                        Online-Buchungen im Zeitraum
                      </td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        {data.falmstudios.online_bookings}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">
                        Online-Passagiere
                      </td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        {data.falmstudios.online_passengers}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">Gebühr pro Passagier</td>
                      <td className="py-2 text-right font-medium text-gray-800">
                        {formatEuro(data.falmstudios.fee_per_passenger)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">Berechnung</td>
                      <td className="py-2 text-right text-xs text-gray-500 font-mono">
                        {data.falmstudios.online_passengers} x{' '}
                        {formatEuro(data.falmstudios.fee_per_passenger)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-800 font-semibold">
                        Gesamtgebühr
                      </td>
                      <td className="py-3 text-right text-lg font-bold text-primary">
                        {formatEuro(data.falmstudios.total_fee)}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-xs text-gray-400">
                  Nächste Abrechnung:{' '}
                  {formatDate(data.falmstudios.next_billing_date)}
                </p>
              </div>
            </div>

            {/* Chat-Verlauf */}
            {data.chat.recent && data.chat.recent.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  Chat-Verlauf
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Die letzten {data.chat.recent.length} Konversationen mit dem Chatbot
                </p>
                <div className="space-y-3">
                  {data.chat.recent.map((c, i) => {
                    const statusColor =
                      c.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : c.status === 'partial'
                          ? 'bg-amber-100 text-amber-700'
                          : c.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : c.status === 'abuse'
                              ? 'bg-red-200 text-red-800'
                              : 'bg-gray-100 text-gray-600';
                    return (
                      <div
                        key={i}
                        className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor}`}>
                              {c.status}
                            </span>
                            {c.topics.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
                              >
                                {t}
                              </span>
                            ))}
                            <span className="text-[10px] text-gray-400">
                              {c.message_count} Nachrichten
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(c.created_at).toLocaleString('de-DE', {
                              day: '2-digit', month: '2-digit', year: '2-digit',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {c.user_questions && (
                          <div className="mb-2">
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Frage
                            </p>
                            <p className="text-sm text-gray-800 leading-snug whitespace-pre-wrap">
                              {c.user_questions}
                            </p>
                          </div>
                        )}
                        {c.ai_answers && (
                          <div>
                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                              Antwort
                            </p>
                            <p className="text-sm text-gray-700 leading-snug whitespace-pre-wrap">
                              {c.ai_answers}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Stat Card Component ──

function StatCard({
  label,
  value,
  change,
  prev,
}: {
  label: string;
  value: string;
  change?: number | null;
  prev?: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {change !== undefined && change !== null && (
        <p
          className={`text-xs mt-1 font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change}% vs. Vorperiode
        </p>
      )}
      {prev !== undefined && (
        <p className="text-xs mt-1 text-gray-400">
          Vorperiode: {prev}
        </p>
      )}
    </div>
  );
}
