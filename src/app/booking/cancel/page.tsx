"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/plausible";

function PaxRow({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-dark/80">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-dark active:bg-gray-50"
        >
          −
        </button>
        <span className="w-8 text-center text-lg font-bold">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg font-bold text-dark active:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

interface BookingDetails {
  id: string;
  booking_reference: string;
  status: string;
  booking_date: string;
  adults: number;
  children: number;
  children_free: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  tour: {
    name: string;
    slug: string;
  } | null;
  departure: {
    id: string;
    departure_time: string;
  } | null;
}

function CancelLookupForm() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [foundBooking, setFoundBooking] = useState<{ id: string; token: string } | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) return;
    trackEvent("Cancellation Started");
    setLookupLoading(true);
    setLookupError("");

    try {
      const res = await fetch("/api/booking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_reference: reference.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Buchung nicht gefunden.");
      }
      setFoundBooking({ id: data.id, token: data.cancel_token });
    } catch (err) {
      setLookupError(
        err instanceof Error ? err.message : "Buchung nicht gefunden."
      );
    } finally {
      setLookupLoading(false);
    }
  }

  if (foundBooking) {
    // Redirect to the cancel page with params
    if (typeof window !== "undefined") {
      window.location.href = `/booking/cancel?id=${foundBooking.id}&token=${foundBooking.token}`;
    }
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <p className="text-dark/50 text-sm">Weiterleitung...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-dark px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Buchung stornieren
            </h1>
            <p className="text-white/60 mt-2 text-sm">
              Inselbahn Helgoland
            </p>
          </div>
          <form onSubmit={handleLookup} className="px-6 py-6 space-y-4">
            <p className="text-dark/60 text-sm">
              Geben Sie Ihre Buchungsnummer und E-Mail-Adresse ein, um Ihre Buchung aufzurufen.
            </p>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Buchungsnummer
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="z.B. IB-2026-XXXX"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-white"
              />
            </div>
            {lookupError && (
              <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-lg">
                {lookupError}
              </p>
            )}
            <button
              type="submit"
              disabled={lookupLoading}
              className="w-full py-3.5 rounded-xl bg-dark text-white font-semibold text-base hover:bg-dark/85 transition-colors disabled:opacity-50"
            >
              {lookupLoading ? "Wird gesucht..." : "Buchung suchen"}
            </button>
          </form>
          {/* Stornierungsbedingungen — always visible */}
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-dark/60 space-y-2">
              <p className="font-medium text-dark/70">Stornierungsbedingungen</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs leading-relaxed">
                <li>Kostenlose Stornierung bis Mitternacht am Vortag (23:59 Uhr).</li>
                <li>Nach Ablauf der Frist ist keine Stornierung mehr möglich.</li>
                <li>Bei Ausfall durch die Inselbahn (z.B. Wetter) erhalten Sie automatisch eine volle Rückerstattung.</li>
                <li>Bei Gutschein-Buchungen wird der Betrag zurück auf den Gutschein gebucht.</li>
                <li>Es besteht kein Widerrufsrecht gemäß §312g Abs. 2 Nr. 9 BGB (Freizeitveranstaltungen mit festem Datum).</li>
              </ul>
            </div>
          </div>
          <div className="px-6 pb-6 text-center">
            <Link
              href="/"
              className="text-dark/50 text-sm hover:text-dark transition-colors"
            >
              &larr; Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function CancelPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const token = searchParams.get("token");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [refundMode, setRefundMode] = useState<'full' | 'partial'>('full');
  const [refAdults, setRefAdults] = useState(0);
  const [refChildren, setRefChildren] = useState(0);
  const [refChildrenFree, setRefChildrenFree] = useState(0);

  const canCancel = useCallback(() => {
    if (!booking) return false;
    if (booking.status !== "confirmed") return false;
    // Check deadline: midnight Berlin time on the booking date
    const now = new Date();
    const berlinNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
    );
    const bookingDate = new Date(booking.booking_date + "T00:00:00");
    return berlinNow < bookingDate;
  }, [booking]);

  useEffect(() => {
    if (!bookingId || !token) {
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(
          `/api/booking/${bookingId}?token=${encodeURIComponent(token!)}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error || "Buchung konnte nicht geladen werden."
          );
        }
        const data: BookingDetails = await res.json();
        setBooking(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Buchung konnte nicht geladen werden."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId, token]);

  async function handleCancel() {
    if (!bookingId || !token || cancelling) return;
    setCancelling(true);
    setCancelError("");

    try {
      const payload: Record<string, unknown> = { cancel_token: token };
      if (refundMode === 'partial') {
        payload.refund_adults = refAdults;
        payload.refund_children = refChildren;
        payload.refund_children_free = refChildrenFree;
      }
      const res = await fetch(`/api/booking/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error || "Stornierung fehlgeschlagen."
        );
      }

      setCancelled(true);
      trackEvent("Cancellation Completed");
    } catch (err) {
      setCancelError(
        err instanceof Error
          ? err.message
          : "Stornierung fehlgeschlagen. Bitte versuchen Sie es erneut."
      );
    } finally {
      setCancelling(false);
    }
  }

  // No params — show lookup form
  if (!bookingId || !token) {
    return <CancelLookupForm />;
  }

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center">
          <svg
            className="animate-spin mx-auto mb-4 text-dark/40"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-dark/50 text-sm">Buchung wird geladen...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">Fehler</h1>
          <p className="text-dark/60 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-dark text-white px-6 py-3 rounded-full font-medium hover:bg-dark/85 transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  // Cancellation success
  if (cancelled) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-dark px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">
                Buchung storniert
              </h1>
              <p className="text-white/60 mt-2 text-sm">
                Ihre Buchung wurde erfolgreich storniert
              </p>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="bg-surface rounded-xl p-5 space-y-3">
                <div>
                  <p className="text-xs text-dark/40 uppercase tracking-wider">
                    Buchungsnummer
                  </p>
                  <p className="text-lg font-bold text-dark">
                    {booking?.booking_reference}
                  </p>
                </div>
                {booking?.tour && (
                  <div>
                    <p className="text-xs text-dark/40 uppercase tracking-wider">
                      Tour
                    </p>
                    <p className="text-dark font-medium">{booking.tour.name}</p>
                  </div>
                )}
                {booking?.booking_date && (
                  <div>
                    <p className="text-xs text-dark/40 uppercase tracking-wider">
                      Datum
                    </p>
                    <p className="text-dark">
                      {new Date(
                        booking.booking_date + "T00:00:00"
                      ).toLocaleDateString("de-DE", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="font-semibold text-dark text-sm">Erstattung</p>
                <p className="text-dark/60 text-sm">
                  Der Betrag von{" "}
                  <strong>
                    {booking?.total_amount?.toFixed(2).replace(".", ",")} &euro;
                  </strong>{" "}
                  wird in der Regel innerhalb weniger Minuten erstattet. In seltenen F&auml;llen kann es bis zu 5&ndash;10 Werktage dauern.
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-blue-800">
                  Eine Best&auml;tigung wurde an{" "}
                  <strong>{booking?.customer_email}</strong> gesendet.
                </p>
              </div>
            </div>

            <div className="px-6 pb-6 text-center">
              <Link
                href="/"
                className="inline-block bg-dark text-white px-8 py-3 rounded-full font-medium hover:bg-dark/85 transition-colors"
              >
                Zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Already refunded/cancelled
  if (booking && (booking.status === "refunded" || booking.status === "cancelled")) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-dark mb-2">
            Bereits storniert
          </h1>
          <p className="text-dark/60 mb-2">
            Diese Buchung ({booking.booking_reference}) wurde bereits storniert.
          </p>
          <p className="text-dark/40 text-sm mb-6">
            Die Erstattung erfolgt in der Regel sofort. In seltenen F&auml;llen kann es bis zu 5&ndash;10 Werktage dauern.
          </p>
          <Link
            href="/"
            className="inline-block bg-dark text-white px-6 py-3 rounded-full font-medium hover:bg-dark/85 transition-colors"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  if (!booking) return null;

  // Format booking info
  const formattedDate = new Date(
    booking.booking_date + "T00:00:00"
  ).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = booking.departure?.departure_time?.slice(0, 5) || "";

  const passengers: string[] = [];
  passengers.push(
    `${booking.adults} ${booking.adults === 1 ? "Erwachsener" : "Erwachsene"}`
  );
  if (booking.children > 0)
    passengers.push(
      `${booking.children} ${booking.children === 1 ? "Kind" : "Kinder"} (bis 15 J.)`
    );
  if (booking.children_free > 0)
    passengers.push(
      `${booking.children_free} ${booking.children_free === 1 ? "Kind" : "Kinder"} (0\u20135, frei)`
    );

  const isAllowed = canCancel();

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-dark px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Buchung stornieren
            </h1>
            <p className="text-white/60 mt-2 text-sm">
              Inselbahn Helgoland
            </p>
          </div>

          {/* Booking details */}
          <div className="px-6 py-6 space-y-4">
            <div className="bg-surface rounded-xl p-5 space-y-3">
              <div>
                <p className="text-xs text-dark/40 uppercase tracking-wider">
                  Buchungsnummer
                </p>
                <p className="text-lg font-bold text-dark">
                  {booking.booking_reference}
                </p>
              </div>
              {booking.tour && (
                <div>
                  <p className="text-xs text-dark/40 uppercase tracking-wider">
                    Tour
                  </p>
                  <p className="text-dark font-medium">{booking.tour.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-dark/40 uppercase tracking-wider">
                  Datum &amp; Uhrzeit
                </p>
                <p className="text-dark">
                  {formattedDate}
                  {formattedTime && `, ${formattedTime} Uhr`}
                </p>
              </div>
              <div>
                <p className="text-xs text-dark/40 uppercase tracking-wider">
                  Fahrg&auml;ste
                </p>
                <p className="text-dark">{passengers.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-dark/40 uppercase tracking-wider">
                  Gezahlter Betrag
                </p>
                <p className="text-lg font-bold text-dark">
                  {booking.total_amount?.toFixed(2).replace(".", ",")} &euro;
                </p>
              </div>
            </div>

            {/* Cancellation policy */}
            <div className="border-l-4 border-amber-500 pl-4 py-2">
              <p className="font-semibold text-dark text-sm">
                Stornierungsbedingungen
              </p>
              <ul className="text-dark/60 text-sm mt-1 space-y-1 list-disc list-inside">
                <li>Kostenlose Stornierung bis Mitternacht am Vortag (23:59 Uhr).</li>
                <li>Nach Ablauf der Frist ist keine Stornierung mehr m&ouml;glich.</li>
                <li>Bei Ausfall durch die Inselbahn (z.B. Wetter) erhalten Sie automatisch eine volle R&uuml;ckerstattung.</li>
                <li>Es besteht kein Widerrufsrecht gem&auml;&szlig; &sect;312g Abs. 2 Nr. 9 BGB (Freizeitveranstaltungen mit festem Datum).</li>
              </ul>
            </div>

            {/* Cancel error */}
            {cancelError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
                {cancelError}
              </div>
            )}

            {/* Partial / full toggle */}
            {isAllowed && (booking.adults + booking.children + (booking.children_free || 0)) > 1 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-dark text-sm mb-3">Was m&ouml;chten Sie erstatten?</p>
                <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setRefundMode('full')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${refundMode === 'full' ? 'bg-primary text-white' : 'text-gray-600'}`}
                  >
                    Komplette Buchung
                  </button>
                  <button
                    onClick={() => setRefundMode('partial')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md ${refundMode === 'partial' ? 'bg-primary text-white' : 'text-gray-600'}`}
                  >
                    Einzelne Personen
                  </button>
                </div>
                {refundMode === 'partial' && (
                  <div className="space-y-3">
                    <p className="text-xs text-dark/60">
                      Der Platz wird freigegeben und der Betrag automatisch erstattet.
                    </p>
                    {booking.adults > 0 && (
                      <PaxRow
                        label={`Erwachsene (max ${booking.adults})`}
                        value={refAdults}
                        max={booking.adults}
                        onChange={setRefAdults}
                      />
                    )}
                    {booking.children > 0 && (
                      <PaxRow
                        label={`Kinder (max ${booking.children})`}
                        value={refChildren}
                        max={booking.children}
                        onChange={setRefChildren}
                      />
                    )}
                    {(booking.children_free || 0) > 0 && (
                      <PaxRow
                        label={`Kleinkinder (max ${booking.children_free})`}
                        value={refChildrenFree}
                        max={booking.children_free || 0}
                        onChange={setRefChildrenFree}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action */}
            {isAllowed ? (
              <button
                onClick={handleCancel}
                disabled={cancelling || (refundMode === 'partial' && refAdults + refChildren + refChildrenFree === 0)}
                className={`w-full py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 ${
                  cancelling
                    ? "bg-red-200 text-red-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {cancelling && (
                  <svg
                    className="animate-spin w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      opacity="0.25"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {cancelling
                  ? "Wird bearbeitet..."
                  : refundMode === 'partial'
                    ? `${refAdults + refChildren + refChildrenFree} Person${refAdults + refChildren + refChildrenFree === 1 ? '' : 'en'} erstatten`
                    : "Buchung stornieren"}
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-center">
                <p className="text-amber-800 font-medium text-sm">
                  Stornierung nicht mehr m&ouml;glich. Die Stornierungsfrist (Mitternacht am Vortag) ist bereits abgelaufen.
                </p>
              </div>
            )}

            <p className="text-center text-dark/40 text-xs">
              Fragen?{" "}
              <a
                href="mailto:info@helgolandbahn.de"
                className="underline text-dark/60"
              >
                info@helgolandbahn.de
              </a>
            </p>
          </div>

          {/* Back link */}
          <div className="px-6 pb-6 text-center">
            <Link
              href="/"
              className="text-dark/50 text-sm hover:text-dark transition-colors"
            >
              &larr; Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CancelPage() {
  return (
    <>
    <Header />
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-surface px-4">
          <div className="text-center">
            <svg
              className="animate-spin mx-auto mb-4 text-dark/40"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-dark/50 text-sm">Wird geladen...</p>
          </div>
        </main>
      }
    >
      <CancelPageContent />
    </Suspense>
    <Footer />
    </>
  );
}
