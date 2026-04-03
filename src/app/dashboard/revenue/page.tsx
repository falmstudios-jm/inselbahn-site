'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../dashboard-shell';

interface PaymentBreakdown {
  method: string;
  revenue: number;
  count: number;
}

interface TourBreakdown {
  tour_name: string;
  revenue: number;
  passengers: number;
}

interface DepartureBreakdown {
  departure_id: string;
  departure_time: string;
  tour_name: string;
  revenue: number;
  passengers: number;
}

interface StaffBreakdown {
  staff_id: string;
  staff_name: string;
  revenue: number;
  count: number;
}

interface RevenueData {
  date: string;
  total_revenue: number;
  total_passengers: number;
  by_payment_method: PaymentBreakdown[];
  by_tour: TourBreakdown[];
  by_departure: DepartureBreakdown[];
  by_staff: StaffBreakdown[];
  is_admin: boolean;
}

interface MyRevenueData {
  date: string;
  staff_name: string;
  total_revenue: number;
  total_passengers: number;
  total_bookings: number;
  by_payment_method: PaymentBreakdown[];
  by_departure: DepartureBreakdown[];
}

export default function RevenuePage() {
  const { role, staffId } = useDashboard();
  const isAdmin = role === 'admin' || role === 'seller';

  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  });
  const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  const isToday = selectedDate === todayISO;

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [myRevenueData, setMyRevenueData] = useState<MyRevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  // Drivers see "my revenue" by default; admin/seller sees all
  const [viewMode, setViewMode] = useState<'all' | 'mine'>(isAdmin ? 'all' : 'mine');

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    return `${h}:${m}`;
  };

  const loadRevenue = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'all' && isAdmin) {
        const res = await fetch(`/api/dashboard/revenue?date=${selectedDate}`);
        const json = await res.json();
        setRevenueData(json);
        setMyRevenueData(null);
      } else {
        // Driver view: use my-revenue endpoint
        const res = await fetch(`/api/dashboard/my-revenue?date=${selectedDate}`);
        const json = await res.json();
        setMyRevenueData(json);
        setRevenueData(null);
      }
    } catch {
      console.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, viewMode, isAdmin]);

  useEffect(() => {
    loadRevenue();
    const interval = setInterval(loadRevenue, 60000);
    return () => clearInterval(interval);
  }, [loadRevenue]);

  // Also allow admin to see their own sales
  useEffect(() => {
    if (!isAdmin) {
      setViewMode('mine');
    }
  }, [isAdmin, staffId]);

  const paymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Barzahlung';
      case 'sumup': return 'Karte/SumUp';
      case 'stripe': return 'Online (Stripe)';
      case 'manual_entry': return 'Manuell nachgetragen';
      default: return 'Online';
    }
  };

  const paymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-700';
      case 'sumup': return 'bg-blue-100 text-blue-700';
      case 'stripe': return 'bg-purple-100 text-purple-700';
      case 'manual_entry': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-dark mb-3">Umsatz</h1>

      {/* Date selector */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-3 shadow-sm border border-gray-200">
        <button
          onClick={() => changeDate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 active:bg-gray-100"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="font-semibold text-dark">
            {isToday ? 'Heute' : formatDateLabel(selectedDate)}
          </div>
          {isToday && (
            <div className="text-xs text-gray-500">{formatDateLabel(selectedDate)}</div>
          )}
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayISO)}
              className="text-xs text-primary font-medium"
            >
              Heute
            </button>
          )}
        </div>
        <button
          onClick={() => changeDate(1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-50 active:bg-gray-100"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* View toggle (admin/seller only) */}
      {isAdmin && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setViewMode('all')}
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
              viewMode === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Alle Umsätze
          </button>
          <button
            onClick={() => setViewMode('mine')}
            className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors ${
              viewMode === 'mine'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Meine Verkäufe
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Laden...</div>
        </div>
      ) : viewMode === 'all' && revenueData ? (
        /* Admin/Seller: All revenue view */
        <>
          {/* Total card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
            <div className="text-sm text-gray-500 mb-1">Gesamtumsatz</div>
            <div className="text-4xl font-bold text-primary">
              {revenueData.total_revenue.toFixed(2)} &euro;
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {revenueData.total_passengers} Fahrg&auml;ste
            </div>
          </div>

          {/* By payment method */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Nach Zahlungsart
          </h2>
          <div className="space-y-2 mb-6">
            {revenueData.by_payment_method.map((pm) => (
              <div
                key={pm.method}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${paymentIcon(pm.method)}`}>
                    {pm.count}
                  </div>
                  <div>
                    <div className="font-medium text-dark">{paymentLabel(pm.method)}</div>
                    <div className="text-xs text-gray-500">{pm.count} Buchungen</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-dark">
                  {pm.revenue.toFixed(2)} &euro;
                </div>
              </div>
            ))}
            {revenueData.by_payment_method.length === 0 && (
              <div className="text-center text-gray-400 py-4">
                Noch keine Ums&auml;tze
              </div>
            )}
          </div>

          {/* By departure */}
          {revenueData.by_departure && revenueData.by_departure.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nach Abfahrt
              </h2>
              <div className="space-y-2 mb-6">
                {revenueData.by_departure.map((d) => (
                  <div
                    key={d.departure_id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-dark">
                        {formatTime(d.departure_time)} — {d.tour_name}
                      </div>
                      <div className="text-xs text-gray-500">{d.passengers} Fahrg&auml;ste</div>
                    </div>
                    <div className="text-lg font-bold text-dark">
                      {d.revenue.toFixed(2)} &euro;
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* By staff (admin only) */}
          {revenueData.by_staff && revenueData.by_staff.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nach Mitarbeiter
              </h2>
              <div className="space-y-2 mb-6">
                {revenueData.by_staff.map((s) => (
                  <div
                    key={s.staff_id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {s.staff_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-dark">{s.staff_name}</div>
                        <div className="text-xs text-gray-500">{s.count} Buchungen</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-dark">
                      {s.revenue.toFixed(2)} &euro;
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : myRevenueData ? (
        /* Driver: My revenue view */
        <>
          {/* Total card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
            <div className="text-sm text-gray-500 mb-1">Meine Verk&auml;ufe</div>
            <div className="text-4xl font-bold text-primary">
              {myRevenueData.total_revenue.toFixed(2)} &euro;
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{myRevenueData.total_passengers} Fahrg&auml;ste</span>
              <span className="text-gray-300">|</span>
              <span>{myRevenueData.total_bookings} Buchungen</span>
            </div>
          </div>

          {/* By departure (driver view — no payment breakdown, just per-tour) */}
          {myRevenueData.by_departure && myRevenueData.by_departure.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Nach Abfahrt
              </h2>
              <div className="space-y-2 mb-6">
                {myRevenueData.by_departure.map((d) => (
                  <div
                    key={d.departure_id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-dark">
                        {formatTime(d.departure_time)} — {d.tour_name}
                      </div>
                      <div className="text-xs text-gray-500">{d.passengers} Fahrg&auml;ste</div>
                    </div>
                    <div className="text-lg font-bold text-dark">
                      {d.revenue.toFixed(2)} &euro;
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Keine Daten verf&uuml;gbar</div>
        </div>
      )}
    </div>
  );
}
