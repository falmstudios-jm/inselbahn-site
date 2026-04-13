'use client';

import { useState, useEffect, useCallback } from 'react';

interface BookingEntry {
  id: string;
  booking_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  adults: number;
  children: number;
  children_free: number;
  total_amount: number;
  status: string;
  payment_method: string | null;
  booking_date: string;
  created_at: string;
  cancelled_at: string | null;
  notes: string | null;
  discount_amount: number | null;
  stripe_payment_intent_id: string | null;
  gift_card_id: string | null;
  departure: {
    id: string;
    departure_time: string;
    tour: { id: string; slug: string; name: string };
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Bestätigt', color: 'bg-green-100 text-green-700' },
  refunded: { label: 'Erstattet', color: 'bg-red-100 text-red-700' },
  partial_refund: { label: 'Teilerstattet', color: 'bg-amber-100 text-amber-700' },
  our_cancellation: { label: 'Storniert', color: 'bg-gray-200 text-gray-600' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tourFilter, setTourFilter] = useState<'all' | 'premium' | 'unterland'>('all');
  const [sortBy, setSortBy] = useState<'booking_date' | 'created_at'>('booking_date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [dateFrom, setDateFrom] = useState(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  });
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Refund
  const [refundId, setRefundId] = useState<string | null>(null);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      if (search) params.set('search', search);
      if (tourFilter !== 'all') params.set('tour', tourFilter);
      params.set('sort', sortBy);
      params.set('dir', sortDir);

      const res = await fetch(`/api/dashboard/bookings?${params.toString()}`);
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, tourFilter, sortBy, sortDir]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefund = async (bookingId: string) => {
    setRefundSubmitting(true);
    setRefundError('');
    try {
      const res = await fetch('/api/dashboard/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, amount: 0, reason: 'Volle Erstattung' }),
      });
      const data = await res.json();
      if (data.success) {
        setRefundId(null);
        load();
      } else {
        setRefundError(data.error || 'Fehler');
      }
    } catch {
      setRefundError('Verbindungsfehler');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

  const formatTime = (t: string) => t?.slice(0, 5) || '';

  const toggleSort = (field: 'booking_date' | 'created_at') => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-28">
      <h1 className="text-xl font-bold text-dark mb-4">Buchungen</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Name, E-Mail, Telefon, Referenz..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-base"
      />

      {/* Date range */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Von</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Bis</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
          />
        </div>
      </div>

      {/* Tour filter */}
      <div className="flex gap-1 mb-3 bg-gray-100 rounded-xl p-1">
        {([['all', 'Alles'], ['premium', 'Premium'], ['unterland', 'Unterland']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTourFilter(key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              tourFilter === key ? 'bg-white text-dark shadow-sm' : 'text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sort toggles */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => toggleSort('booking_date')}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
            sortBy === 'booking_date' ? 'bg-dark text-white border-dark' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          Tourdatum {sortBy === 'booking_date' && (sortDir === 'desc' ? '↓' : '↑')}
        </button>
        <button
          onClick={() => toggleSort('created_at')}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
            sortBy === 'created_at' ? 'bg-dark text-white border-dark' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          Buchungsdatum {sortBy === 'created_at' && (sortDir === 'desc' ? '↓' : '↑')}
        </button>
        <span className="text-xs text-gray-400 self-center ml-auto">{bookings.length} Ergebnisse</span>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Laden...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Keine Buchungen gefunden</div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const isExpanded = expandedId === b.id;
            const status = STATUS_LABELS[b.status] || { label: b.status, color: 'bg-gray-100 text-gray-600' };
            const isBlocked = b.customer_name === 'BLOCKIERT' || b.customer_name?.startsWith('GESPERRT');
            if (isBlocked) return null;

            const tourSlug = b.departure?.tour?.slug || '';
            const tourColor = tourSlug.includes('premium')
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            const passengers: string[] = [];
            if (b.adults > 0) passengers.push(`${b.adults} Erw`);
            if (b.children > 0) passengers.push(`${b.children} Kind`);
            if (b.children_free > 0) passengers.push(`${b.children_free} frei`);

            return (
              <div key={b.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="w-full text-left px-4 py-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-dark truncate">{b.customer_name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-mono text-xs text-gray-400">{b.booking_reference}</span>
                    <span className="text-gray-300">|</span>
                    <span>{formatDate(b.booking_date)} {formatTime(b.departure?.departure_time || '')}</span>
                    <span className="text-gray-300">|</span>
                    <span>{passengers.join(' + ')}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tourColor}`}>
                      {b.departure?.tour?.name || 'Tour'}
                    </span>
                    <span className="text-sm font-semibold text-dark">
                      {Number(b.total_amount).toFixed(2).replace('.', ',')} €
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-400">E-Mail</span>
                        <div className="font-medium">
                          <a href={`mailto:${b.customer_email}`} className="text-blue-600 underline">
                            {b.customer_email}
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Telefon</span>
                        <div className="font-medium">
                          {b.customer_phone ? (
                            <a href={`tel:${b.customer_phone}`} className="text-blue-600 underline">
                              {b.customer_phone}
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Zahlung</span>
                        <div className="font-medium">{b.payment_method || '—'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Gebucht am</span>
                        <div className="font-medium">
                          {new Date(b.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {b.discount_amount && Number(b.discount_amount) > 0 && (
                        <div>
                          <span className="text-gray-400">Rabatt</span>
                          <div className="font-medium text-green-600">
                            -{Number(b.discount_amount).toFixed(2).replace('.', ',')} €
                          </div>
                        </div>
                      )}
                      {b.notes && (
                        <div className="col-span-2">
                          <span className="text-gray-400">Notizen</span>
                          <div className="font-medium">{b.notes}</div>
                        </div>
                      )}
                    </div>

                    {/* Refund button */}
                    {b.status === 'confirmed' && (
                      <div className="pt-2 border-t border-gray-200">
                        {refundId === b.id ? (
                          <div className="space-y-2">
                            <p className="text-sm text-red-600 font-medium">
                              Wirklich {Number(b.total_amount).toFixed(2).replace('.', ',')} € erstatten?
                            </p>
                            {refundError && <p className="text-xs text-red-500">{refundError}</p>}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRefund(b.id)}
                                disabled={refundSubmitting}
                                className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                              >
                                {refundSubmitting ? 'Wird erstattet...' : 'Ja, erstatten'}
                              </button>
                              <button
                                onClick={() => { setRefundId(null); setRefundError(''); }}
                                className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRefundId(b.id)}
                            className="w-full py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-200 active:bg-red-100"
                          >
                            Erstatten
                          </button>
                        )}
                      </div>
                    )}

                    {b.status === 'refunded' && b.cancelled_at && (
                      <div className="text-xs text-gray-400">
                        Erstattet am {new Date(b.cancelled_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
