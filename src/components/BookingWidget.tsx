"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

/* ─── Stripe singleton ─── */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/* ─── Types ─── */
interface AvailabilitySlot {
  departure_id: string;
  departure_time: string;
  departure_notes: string | null;
  tour_slug: string;
  tour_name: string;
  max_capacity: number;
  booked: number;
  remaining: number;
  available: boolean;
  price_adult: number;
  price_child: number;
}

interface AvailabilityResponse {
  date: string;
  slots: AvailabilitySlot[];
}

/* ─── Constants ─── */
const tourOptions = [
  {
    id: "unterland",
    name: "Unterland-Tour",
    subtitle: "~45 Min",
    adultPrice: 11,
    childPrice: 6,
    capacity: 42,
    duration: "ca. 40 Minuten",
    description: "Geführte Rundfahrt durch das Unterland",
    highlights: ["Hummerbuden", "Binnenhafen", "Hermann Marwede"],
    wheelchair: true,
    dogs: true,
    accent: "amber" as const,
  },
  {
    id: "premium",
    name: "Premium-Tour",
    subtitle: "~90 Min",
    adultPrice: 22,
    childPrice: 15,
    capacity: 18,
    duration: "ca. 90 Minuten",
    description: "Exklusive Kleingruppe mit Langer Anna",
    highlights: ["Oberland & Pinneberg", "Lange Anna", "Leuchtturm"],
    wheelchair: false,
    dogs: false,
    accent: "navy" as const,
    badge: "EXKLUSIV",
  },
];

const MAX_FUTURE_DAYS = 90;

const STEPS = ["Datum", "Tour", "Uhrzeit", "Personen", "Kontakt", "Zahlung"];
const RESERVATION_SECONDS = 15 * 60; // 15 minutes

function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const monthNames = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

/* ─── Spinner ─── */
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Countdown Timer Hook ─── */
function useCountdown(startedAt: number | null) {
  const [secondsLeft, setSecondsLeft] = useState(RESERVATION_SECONDS);

  useEffect(() => {
    if (!startedAt) return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, RESERVATION_SECONDS - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const expired = secondsLeft <= 0;
  const urgent = secondsLeft <= 120; // last 2 minutes

  return { secondsLeft, display, expired, urgent };
}

/* ─── Stripe Payment Form (inner, must be inside <Elements>) ─── */
function CheckoutForm({
  totalPrice,
  onSuccess,
  onError,
}: {
  totalPrice: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    onError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // fallback, not normally used
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.");
      setProcessing(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        onReady={() => setReady(true)}
        options={{
          layout: "tabs",
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || processing || !ready}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2 ${
          processing || !ready
            ? "bg-dark/10 text-dark/30 cursor-not-allowed"
            : "bg-dark text-white hover:bg-dark/85"
        }`}
      >
        {processing && <Spinner className="w-5 h-5" />}
        {processing
          ? "Wird verarbeitet..."
          : `Jetzt bezahlen — ${totalPrice.toFixed(2).replace(".", ",")} \u20AC`}
      </button>
    </form>
  );
}

/* ─── Main Component ─── */
export default function BookingWidget() {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenFree, setChildrenFree] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState("");
  const [invoiceStreet, setInvoiceStreet] = useState("");
  const [invoicePostalCode, setInvoicePostalCode] = useState("");
  const [invoiceCity, setInvoiceCity] = useState("");
  const [invoiceVatId, setInvoiceVatId] = useState("");

  // Availability state
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string>("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [reservationStart, setReservationStart] = useState<number | null>(null);

  const now = useRef(new Date()).current;
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const calDays = generateCalendarDays(calYear, calMonth);

  // Countdown
  const { display: countdownDisplay, expired: countdownExpired, urgent: countdownUrgent } = useCountdown(reservationStart);

  // Filtered slots for selected tour
  const filteredSlots = useMemo(
    () => slots.filter((s) => s.tour_slug === selectedTour),
    [slots, selectedTour],
  );

  // Prices from the selected slot (API-driven)
  const adultPrice = selectedSlot?.price_adult ?? tourOptions.find((t) => t.id === selectedTour)?.adultPrice ?? 0;
  const childPrice = selectedSlot?.price_child ?? tourOptions.find((t) => t.id === selectedTour)?.childPrice ?? 0;
  const remaining = selectedSlot?.remaining ?? 20;

  const totalPrice = adultPrice * adults + childPrice * children;

  /* ─── Fetch availability when date changes ─── */
  const fetchAvailability = useCallback(async (date: string) => {
    setSlotsLoading(true);
    setSlotsError("");
    setSlots([]);
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      if (!res.ok) throw new Error("Verfügbarkeit konnte nicht geladen werden.");
      const data: AvailabilityResponse = await res.json();
      setSlots(data.slots);
    } catch {
      setSlotsError("Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
      // Reset downstream selections
      setSelectedTime("");
      setSelectedSlot(null);
    }
  }, [selectedDate, fetchAvailability]);

  /* ─── Cap passengers to remaining capacity ─── */
  useEffect(() => {
    const total = adults + children + childrenFree;
    if (total > remaining) {
      const excess = total - remaining;
      // Trim childrenFree first, then children, then adults
      let toRemove = excess;
      const newFree = Math.max(0, childrenFree - toRemove);
      toRemove -= childrenFree - newFree;
      const newChildren = Math.max(0, children - toRemove);
      toRemove -= children - newChildren;
      const newAdults = Math.max(1, adults - toRemove);
      setChildrenFree(newFree);
      setChildren(newChildren);
      setAdults(newAdults);
    }
  }, [remaining, adults, children, childrenFree]);

  /* ─── Handle countdown expiry ─── */
  useEffect(() => {
    if (countdownExpired && step === 5 && !paymentSuccess) {
      // Timer ran out — reservation expired
      setClientSecret(null);
      setReservationStart(null);
    }
  }, [countdownExpired, step, paymentSuccess]);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return selectedDate !== "";
      case 1:
        return selectedTour !== "";
      case 2:
        return selectedTime !== "" && selectedSlot !== null;
      case 3:
        return adults > 0;
      case 4: {
        const baseValid =
          contactName.trim() !== "" &&
          contactEmail.trim() !== "" &&
          contactPhone.trim() !== "" &&
          gdprConsent &&
          !submitting;
        if (!baseValid) return false;
        if (wantsInvoice) {
          return (
            invoiceCompany.trim().length >= 2 &&
            invoiceStreet.trim().length >= 2 &&
            invoicePostalCode.trim().length >= 4 &&
            invoiceCity.trim().length >= 2
          );
        }
        return true;
      }
      default:
        return false;
    }
  }, [step, selectedDate, selectedTour, selectedTime, selectedSlot, adults, contactName, contactEmail, contactPhone, gdprConsent, submitting, wantsInvoice, invoiceCompany, invoiceStreet, invoicePostalCode, invoiceCity]);

  /* ─── Submit booking → get client_secret → go to payment step ─── */
  async function handleSubmit() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_id: selectedSlot.departure_id,
          booking_date: selectedDate,
          adults,
          children,
          children_free: childrenFree,
          customer_name: contactName.trim(),
          customer_email: contactEmail.trim(),
          customer_phone: contactPhone.trim(),
          ...(wantsInvoice
            ? {
                invoice: {
                  company_name: invoiceCompany.trim(),
                  street: invoiceStreet.trim(),
                  postal_code: invoicePostalCode.trim(),
                  city: invoiceCity.trim(),
                  ...(invoiceVatId.trim() ? { vat_id: invoiceVatId.trim() } : {}),
                },
              }
            : {}),
        }),
      });

      if (res.status === 409) {
        setSubmitError("Diese Abfahrt ist leider ausgebucht. Bitte wählen Sie eine andere Zeit.");
        setStep(2);
        setSelectedTime("");
        setSelectedSlot(null);
        fetchAvailability(selectedDate);
        return;
      }

      if (res.status === 400) {
        const data = await res.json();
        setSubmitError(data.error || data.message || "Ungültige Eingabe. Bitte überprüfen Sie Ihre Daten.");
        return;
      }

      if (!res.ok) {
        throw new Error("server");
      }

      const data = await res.json();
      setClientSecret(data.client_secret);
      setBookingReference(data.booking_reference);
      setReservationStart(Date.now());
      setPaymentError("");
      setPaymentSuccess(false);
      setStep(5); // Go to payment step
    } catch {
      setSubmitError("Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setSubmitError("");
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      handleSubmit();
    }
  }

  function handleBack() {
    setSubmitError("");
    if (step > 0 && step <= 4) setStep(step - 1);
  }

  function handleStartOver() {
    setStep(0);
    setSelectedDate("");
    setSelectedTour("");
    setSelectedTime("");
    setSelectedSlot(null);
    setAdults(2);
    setChildren(0);
    setChildrenFree(0);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setGdprConsent(false);
    setWantsInvoice(false);
    setInvoiceCompany("");
    setInvoiceStreet("");
    setInvoicePostalCode("");
    setInvoiceCity("");
    setInvoiceVatId("");
    setClientSecret(null);
    setBookingReference("");
    setPaymentError("");
    setPaymentSuccess(false);
    setReservationStart(null);
    setSubmitError("");
  }

  function nextMonth() {
    // Don't go beyond MAX_FUTURE_DAYS from today
    const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + MAX_FUTURE_DAYS);
    const nextM = calMonth === 11 ? 0 : calMonth + 1;
    const nextY = calMonth === 11 ? calYear + 1 : calYear;
    if (new Date(nextY, nextM, 1) > maxDate) return;
    setCalMonth(nextM);
    setCalYear(nextY);
  }

  function prevMonth() {
    const minMonth = now.getMonth();
    const minYear = now.getFullYear();
    if (calYear === minYear && calMonth === minMonth) return;
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  }

  function formatTime(t: string) {
    return t.slice(0, 5);
  }

  const totalPassengers = adults + children + childrenFree;
  const canAddMore = totalPassengers < remaining;

  /* ─── Payment Success ─── */
  if (paymentSuccess) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          {/* Green checkmark */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-4">
            Buchung best&auml;tigt!
          </h2>
          <p className="text-dark/60 text-lg mb-2">
            Vielen Dank f&uuml;r Ihre Buchung.
          </p>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark/50">Buchungsnummer</span>
              <span className="text-dark font-bold text-base">{bookingReference}</span>
            </div>
            {selectedSlot && (
              <div className="flex justify-between text-sm">
                <span className="text-dark/50">Tour</span>
                <span className="text-dark font-medium">{selectedSlot.tour_name}</span>
              </div>
            )}
            {selectedDate && (
              <div className="flex justify-between text-sm">
                <span className="text-dark/50">Datum</span>
                <span className="text-dark font-medium">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            )}
            {selectedTime && (
              <div className="flex justify-between text-sm">
                <span className="text-dark/50">Uhrzeit</span>
                <span className="text-dark font-medium">{selectedTime} Uhr</span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-dark font-medium">Gesamt</span>
              <span className="text-xl font-bold text-dark">{totalPrice.toFixed(2).replace(".", ",")}&euro;</span>
            </div>
          </div>
          <p className="text-dark/50 text-sm mt-6">
            Eine Best&auml;tigung wurde an <strong>{contactEmail}</strong> gesendet.
          </p>
          <button
            onClick={handleStartOver}
            className="mt-8 px-8 py-3 rounded-full font-semibold bg-dark text-white hover:bg-dark/85 transition-colors"
          >
            Neue Buchung
          </button>
        </div>
      </section>
    );
  }

  /* ─── Timer expired on payment step ─── */
  if (step === 5 && countdownExpired && !paymentSuccess) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-4">
            Zeit abgelaufen
          </h2>
          <p className="text-dark/60 text-lg mb-8">
            Die Reservierungszeit ist abgelaufen. Ihre Pl&auml;tze wurden freigegeben. Bitte starten Sie eine neue Buchung.
          </p>
          <button
            onClick={handleStartOver}
            className="px-8 py-3 rounded-full font-semibold bg-dark text-white hover:bg-dark/85 transition-colors"
          >
            Neue Buchung starten
          </button>
        </div>
      </section>
    );
  }

  /* ─── Payment step (step 5) ─── */
  if (step === 5 && clientSecret) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-12 text-center">
            Online buchen
          </h2>

          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      i <= step
                        ? "bg-dark text-white"
                        : "bg-dark/10 text-dark/40"
                    }`}
                  >
                    {i < 5 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`hidden sm:block w-8 md:w-14 h-0.5 mx-1 transition-colors ${
                        i < step ? "bg-dark" : "bg-dark/10"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {STEPS.map((s, i) => (
                <p
                  key={s}
                  className={`text-xs ${
                    i <= step ? "text-dark" : "text-dark/30"
                  }`}
                >
                  {s}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Payment form */}
            <div className="flex-1">
              <div className="max-w-md mx-auto">
                {/* Countdown timer */}
                <div className={`rounded-2xl p-4 mb-6 text-center border ${
                  countdownUrgent
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}>
                  <p className={`text-sm font-medium ${countdownUrgent ? "text-red-700" : "text-amber-700"}`}>
                    Ihre Pl&auml;tze sind noch reserviert
                  </p>
                  <p className={`text-3xl font-bold font-mono mt-1 ${countdownUrgent ? "text-red-600" : "text-amber-600"}`}>
                    {countdownDisplay}
                  </p>
                </div>

                {/* Error banner */}
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm mb-6">
                    {paymentError}
                  </div>
                )}

                {/* Stripe Elements */}
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#1a1a1a",
                          borderRadius: "12px",
                          fontFamily: "inherit",
                        },
                      },
                      locale: "de",
                    }}
                  >
                    <CheckoutForm
                      totalPrice={totalPrice}
                      onSuccess={() => setPaymentSuccess(true)}
                      onError={(msg) => setPaymentError(msg)}
                    />
                  </Elements>
                </div>
              </div>
            </div>

            {/* Summary sidebar */}
            <div className="lg:w-[320px] flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-32">
                <h3 className="text-lg font-bold text-dark mb-4">Ihre Buchung</h3>
                <div className="space-y-3 text-sm">
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Datum</span>
                      <span className="text-dark font-medium">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>
                  )}
                  {selectedSlot && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Tour</span>
                      <span className="text-dark font-medium">{selectedSlot.tour_name}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Uhrzeit</span>
                      <span className="text-dark font-medium">{selectedTime} Uhr</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-dark/50">Erwachsene</span>
                    <span className="text-dark font-medium">{adults} &times; {adultPrice}&euro;</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Kinder (6–14)</span>
                      <span className="text-dark font-medium">{children} &times; {childPrice}&euro;</span>
                    </div>
                  )}
                  {childrenFree > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Kinder (0–5)</span>
                      <span className="text-dark font-medium">kostenlos</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-dark font-medium">Gesamt</span>
                    <span className="text-2xl font-bold text-dark">{totalPrice}&euro;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Steps 0–4: Normal booking flow ─── */
  return (
    <section
      id="buchung"
      className="px-5 md:px-10 lg:px-20 py-20 md:py-28"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-12 text-center">
          Online buchen
        </h2>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i <= step
                      ? "bg-dark text-white"
                      : "bg-dark/10 text-dark/40"
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 md:w-14 h-0.5 mx-1 transition-colors ${
                      i < step ? "bg-dark" : "bg-dark/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <p
                key={s}
                className={`text-xs ${
                  i <= step ? "text-dark" : "text-dark/30"
                }`}
              >
                {s}
              </p>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {submitError && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-5 py-4 text-sm">
              {submitError}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main form area */}
          <div className="flex-1 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${step * 100}%)` }}
            >
              {/* Step 1: Date */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm max-w-md mx-auto">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-5">
                    <button
                      onClick={prevMonth}
                      className="w-9 h-9 flex items-center justify-center hover:bg-dark/5 rounded-full transition-colors"
                      aria-label="Vorheriger Monat"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h3 className="text-lg font-bold text-dark select-none">
                      {monthNames[calMonth]} {calYear}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="w-9 h-9 flex items-center justify-center hover:bg-dark/5 rounded-full transition-colors"
                      aria-label="Nächster Monat"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 gap-0 text-center mb-1">
                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                      <div key={d} className="text-[11px] font-semibold text-dark/40 uppercase tracking-wider py-2">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-0">
                    {calDays.map((day, i) => {
                      if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
                      const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                      const dateObj = new Date(calYear, calMonth, day);
                      const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isPast = dateObj < todayObj;
                      const isToday = dateObj.getTime() === todayObj.getTime();
                      const isTooFar = dateObj.getTime() > todayObj.getTime() + MAX_FUTURE_DAYS * 86400000;
                      const isDisabled = isPast || isTooFar;
                      const isSelected = dateStr === selectedDate;
                      const isFuture = !isPast && !isTooFar;

                      return (
                        <div key={dateStr} className="flex items-center justify-center aspect-square p-0.5 relative group">
                          <button
                            disabled={isDisabled}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`w-full h-full rounded-full text-sm font-medium transition-all relative flex flex-col items-center justify-center ${
                              isDisabled
                                ? "text-dark/15 cursor-not-allowed"
                                : isSelected
                                  ? "bg-dark text-white shadow-md"
                                  : isToday
                                    ? "text-dark ring-2 ring-primary ring-inset hover:bg-primary/5"
                                    : "text-dark hover:bg-dark/5"
                            }`}
                          >
                            <span>{day}</span>
                            {/* Green availability dot */}
                            {isFuture && !isSelected && (
                              <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-green" />
                            )}
                          </button>
                          {/* Tooltip on hover */}
                          {isFuture && (
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 bg-dark text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                              Touren verfügbar
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-[10px] text-dark/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-green" /> Verfügbar
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-dark/40">
                      <span className="w-3 h-3 rounded-full ring-1.5 ring-primary" /> Heute
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Tour */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto space-y-4">
                  {tourOptions.map((t) => {
                    const isSelected = selectedTour === t.id;
                    const isAmber = t.accent === "amber";
                    const accentBorder = isSelected
                      ? "border-dark"
                      : isAmber
                        ? "border-amber-300"
                        : "border-[#1a3a5c]";
                    const accentBg = isSelected
                      ? "bg-dark"
                      : isAmber
                        ? "bg-amber-50"
                        : "bg-[#f0f4f8]";
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setSelectedTour(t.id);
                          setSelectedTime("");
                          setSelectedSlot(null);
                        }}
                        className={`w-full text-left rounded-2xl p-6 transition-all border-2 relative overflow-hidden ${accentBorder} ${
                          isSelected
                            ? `${accentBg} text-white shadow-lg`
                            : `${accentBg} text-dark shadow-sm hover:shadow-md`
                        }`}
                      >
                        {/* Badge for premium */}
                        {"badge" in t && t.badge && !isSelected && (
                          <span className="absolute top-3 right-3 bg-[#1a3a5c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                            {t.badge}
                          </span>
                        )}
                        {"badge" in t && t.badge && isSelected && (
                          <span className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                            {t.badge}
                          </span>
                        )}

                        <p className="text-xl font-bold mb-1">{t.name}</p>
                        <p className={`text-sm mb-3 ${isSelected ? "text-white/70" : "text-dark/50"}`}>
                          {t.description}
                        </p>

                        {/* Meta info row */}
                        <div className={`flex flex-wrap items-center gap-3 text-xs mb-3 ${isSelected ? "text-white/60" : "text-dark/45"}`}>
                          {/* Duration */}
                          <span className="flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {t.duration}
                          </span>
                          {/* Capacity */}
                          <span className="flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                            max. {t.capacity} Pers.
                          </span>
                          {/* Wheelchair */}
                          {t.wheelchair && (
                            <span className="flex items-center gap-1" title="Rollstuhlgerecht">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                              Barrierefrei
                            </span>
                          )}
                          {/* Dogs */}
                          {t.dogs && (
                            <span className="flex items-center gap-1" title="Hunde erlaubt">
                              Hunde OK
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className={`flex items-baseline gap-2 pt-2 border-t ${isSelected ? "border-white/15" : "border-dark/5"}`}>
                          <span className="text-lg font-bold">ab {t.adultPrice}&euro;</span>
                          <span className={`text-xs ${isSelected ? "text-white/50" : "text-dark/40"}`}>
                            Erwachsene &middot; Kinder ab {t.childPrice}&euro;
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Time (API-driven) */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto">
                  {slotsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Spinner className="text-dark/40" />
                      <p className="text-dark/50 text-sm">Verfügbarkeit wird geladen...</p>
                    </div>
                  ) : slotsError ? (
                    <div className="text-center py-12">
                      <p className="text-red-600 text-sm mb-4">{slotsError}</p>
                      <button
                        onClick={() => fetchAvailability(selectedDate)}
                        className="px-5 py-2 rounded-full bg-dark text-white text-sm font-medium hover:bg-dark/85 transition-colors"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  ) : filteredSlots.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-dark/50 text-sm">Keine Abfahrten für diesen Tag verfügbar.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredSlots.map((slot) => {
                        const time = formatTime(slot.departure_time);
                        const isSelected = selectedSlot?.departure_id === slot.departure_id;
                        const soldOut = slot.remaining <= 0;
                        return (
                          <button
                            key={slot.departure_id}
                            disabled={soldOut}
                            onClick={() => {
                              setSelectedTime(time);
                              setSelectedSlot(slot);
                            }}
                            className={`w-full text-left px-6 py-4 rounded-2xl text-base font-medium transition-all border ${
                              soldOut
                                ? "bg-gray-50 text-dark/30 border-gray-100 cursor-not-allowed"
                                : isSelected
                                  ? "bg-dark text-white border-dark shadow-md"
                                  : "bg-white text-dark border-gray-100 shadow-sm hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{time} Uhr</span>
                              <span className={`text-sm ${
                                soldOut
                                  ? "text-red-400"
                                  : isSelected
                                    ? "text-white/70"
                                    : "text-dark/50"
                              }`}>
                                {soldOut
                                  ? "ausgebucht"
                                  : `noch ${slot.remaining} ${slot.remaining === 1 ? "Platz" : "Plätze"}`}
                              </span>
                            </div>
                            {slot.departure_notes && (
                              <p className={`text-xs mt-1 ${isSelected ? "text-white/60" : "text-dark/40"}`}>
                                {slot.departure_notes}
                              </p>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Passengers */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Erwachsene</p>
                      <p className="text-sm text-dark/50">{adultPrice}&euro; pro Person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{adults}</span>
                      <button onClick={() => canAddMore && setAdults(adults + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Children 6-14 (paid) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Kinder 6–14</p>
                      <p className="text-sm text-dark/50">{childPrice}&euro; pro Kind</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{children}</span>
                      <button onClick={() => canAddMore && setChildren(children + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Children 0-5 (free) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Kinder 0–5</p>
                      <p className="text-sm text-dark/50">kostenlos</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildrenFree(Math.max(0, childrenFree - 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{childrenFree}</span>
                      <button onClick={() => canAddMore && setChildrenFree(childrenFree + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Capacity note */}
                  <p className="text-xs text-dark/40 text-center">
                    {totalPassengers} von {remaining} Plätzen belegt
                  </p>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark/60">{adults} &times; Erwachsene</span>
                      <span className="text-dark">{adults * adultPrice}&euro;</span>
                    </div>
                    {children > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">{children} &times; Kinder (6–14)</span>
                        <span className="text-dark">{children * childPrice}&euro;</span>
                      </div>
                    )}
                    {childrenFree > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">{childrenFree} &times; Kinder (0–5)</span>
                        <span className="text-dark">kostenlos</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-dark font-medium">Gesamt</p>
                      <p className="text-2xl font-bold text-dark">{totalPrice}&euro;</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Contact */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Name</label>
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Max Mustermann" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">E-Mail</label>
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="max@beispiel.de" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Telefon</label>
                    <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+49 170 1234567" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                  </div>
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-dark" />
                      <span className="text-sm text-dark/60">
                        Ich stimme der Verarbeitung meiner Daten gem&auml;&szlig; der{" "}
                        <a href="#" className="underline text-dark">Datenschutzerkl&auml;rung</a>{" "}
                        zu.
                      </span>
                    </label>
                  </div>

                  {/* Invoice option */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={wantsInvoice} onChange={(e) => setWantsInvoice(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-dark" />
                      <span className="text-sm text-dark/60">
                        Ich ben&ouml;tige eine Rechnung
                      </span>
                    </label>
                  </div>

                  {wantsInvoice && (
                    <div className="space-y-3 pt-2 pl-7 border-l-2 border-dark/10 ml-2">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">Firma / Name</label>
                        <input type="text" value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} placeholder="Musterfirma GmbH" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">Stra&szlig;e &amp; Hausnr.</label>
                        <input type="text" value={invoiceStreet} onChange={(e) => setInvoiceStreet(e.target.value)} placeholder="Musterstra&szlig;e 1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                      </div>
                      <div className="flex gap-3">
                        <div className="w-1/3">
                          <label className="block text-sm font-medium text-dark mb-1.5">PLZ</label>
                          <input type="text" value={invoicePostalCode} onChange={(e) => setInvoicePostalCode(e.target.value)} placeholder="12345" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                        </div>
                        <div className="w-2/3">
                          <label className="block text-sm font-medium text-dark mb-1.5">Ort</label>
                          <input type="text" value={invoiceCity} onChange={(e) => setInvoiceCity(e.target.value)} placeholder="Berlin" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">USt-IdNr. <span className="text-dark/40 font-normal">(optional)</span></label>
                        <input type="text" value={invoiceVatId} onChange={(e) => setInvoiceVatId(e.target.value)} placeholder="DE123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-32">
              <h3 className="text-lg font-bold text-dark mb-4">Ihre Buchung</h3>
              <div className="space-y-3 text-sm">
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-dark/50">Datum</span>
                    <span className="text-dark font-medium">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                )}
                {selectedSlot && (
                  <div className="flex justify-between">
                    <span className="text-dark/50">Tour</span>
                    <span className="text-dark font-medium">{selectedSlot.tour_name}</span>
                  </div>
                )}
                {!selectedSlot && selectedTour && (
                  <div className="flex justify-between">
                    <span className="text-dark/50">Tour</span>
                    <span className="text-dark font-medium">{tourOptions.find((t) => t.id === selectedTour)?.name}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-dark/50">Uhrzeit</span>
                    <span className="text-dark font-medium">{selectedTime} Uhr</span>
                  </div>
                )}
                {step >= 3 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-dark/50">Erwachsene</span>
                      <span className="text-dark font-medium">{adults} &times; {adultPrice}&euro;</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark/50">Kinder (6–14)</span>
                        <span className="text-dark font-medium">{children} &times; {childPrice}&euro;</span>
                      </div>
                    )}
                    {childrenFree > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark/50">Kinder (0–5)</span>
                        <span className="text-dark font-medium">kostenlos</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {step >= 3 && (
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-dark font-medium">Gesamt</span>
                    <span className="text-2xl font-bold text-dark">{totalPrice}&euro;</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="max-w-2xl mx-auto flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              step === 0 ? "text-dark/20 cursor-not-allowed" : "text-dark hover:bg-dark/5"
            }`}
          >
            Zurück
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2 ${
              canProceed
                ? "bg-dark text-white hover:bg-dark/85"
                : "bg-dark/10 text-dark/30 cursor-not-allowed"
            }`}
          >
            {submitting && <Spinner className="w-5 h-5" />}
            {step === 4 ? "Zur Kasse" : "Weiter"}
          </button>
        </div>
      </div>
    </section>
  );
}
