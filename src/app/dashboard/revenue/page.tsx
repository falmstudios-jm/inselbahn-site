'use client';

import { useState, useEffect, useCallback } from 'react';

interface RevenueData {
  total_revenue: number;
  total_passengers: number;
  by_payment_method: {
    method: string;
    revenue: number;
    count: number;
  }[];
  by_tour: {
    tour_name: string;
    revenue: number;
    passengers: number;
  }[];
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Berlin',
  });

  const loadRevenue = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/revenue');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRevenue();
    const interval = setInterval(loadRevenue, 60000);
    return () => clearInterval(interval);
  }, [loadRevenue]);

  const paymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Barzahlung';
      case 'sumup': return 'SumUp (Karte)';
      case 'stripe': return 'Online (Stripe)';
      default: return 'Online';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Laden...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Keine Daten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-dark mb-1">Tagesumsatz</h1>
      <p className="text-sm text-gray-500 mb-4">{today}</p>

      {/* Total revenue card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-4">
        <div className="text-sm text-gray-500 mb-1">Gesamtumsatz heute</div>
        <div className="text-4xl font-bold text-primary">
          {data.total_revenue.toFixed(2)} &euro;
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {data.total_passengers} Fahrgäste
        </div>
      </div>

      {/* By payment method */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Nach Zahlungsart
      </h2>
      <div className="space-y-2 mb-6">
        {data.by_payment_method.map((pm) => (
          <div
            key={pm.method}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-dark">{paymentLabel(pm.method)}</div>
              <div className="text-sm text-gray-500">{pm.count} Buchungen</div>
            </div>
            <div className="text-xl font-bold text-dark">
              {pm.revenue.toFixed(2)} &euro;
            </div>
          </div>
        ))}
        {data.by_payment_method.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Noch keine Umsätze heute
          </div>
        )}
      </div>

      {/* By tour */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Nach Tour
      </h2>
      <div className="space-y-2">
        {data.by_tour.map((t) => (
          <div
            key={t.tour_name}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-dark">{t.tour_name}</div>
              <div className="text-sm text-gray-500">{t.passengers} Fahrgäste</div>
            </div>
            <div className="text-xl font-bold text-dark">
              {t.revenue.toFixed(2)} &euro;
            </div>
          </div>
        ))}
        {data.by_tour.length === 0 && (
          <div className="text-center text-gray-400 py-4">
            Noch keine Umsätze heute
          </div>
        )}
      </div>
    </div>
  );
}
