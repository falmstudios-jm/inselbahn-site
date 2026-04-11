"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import DiscountGiftSection, { type AppliedGiftCard, type AppliedDiscount } from "./DiscountGiftSection";

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
  online_capacity?: number;
  booked: number;
  remaining: number;
  physical_remaining?: number;
  available: boolean;
  online_sold_out?: boolean;
  bookable_online: boolean;
  past?: boolean;
  cancelled?: boolean;
  price_adult: number;
  price_child: number;
  wheelchair_available?: boolean;
}

interface AvailabilityResponse {
  date: string;
  slots: AvailabilitySlot[];
}

/* ─── Constants ─── */
const tourOptions = [
  {
    id: "premium",
    slug: "premium-tour",
    name: "Premium-Tour",
    subtitle: "Kleine Gruppe mit der Langen Anna",
    adultPrice: 22,
    childPrice: 15,
    capacity: 18,
    duration: "ca. 90 Minuten",
    description: "Das komplette Helgoland-Erlebnis. Zunächst das Unterland, dann hinauf ins Oberland am Pinneberg vorbei - mit 30 Minuten freier Erkundungszeit an der Langen Anna.",
    highlights: [
      "Unterland & Oberland komplett",
      "30 Min freie Erkundung an der Langen Anna",
      "Leuchtturm, Kleingärten & Lummenfelsen",
      "Kleine Gruppe (max. 18 Personen)",
      "Einblicke in den Inselalltag - Geschichten, die nicht im Reiseführer stehen",
    ],
    wheelchair: false,
    dogs: false,
    accent: "navy" as const,
    badge: "PREMIUM",
    illustration: "/images/inselbahn-illustration-premium.svg",
    photo: "/images/extra-img_2202-2.jpg",
  },
  {
    id: "unterland",
    slug: "unterland-tour",
    name: "Unterland-Tour",
    subtitle: "Geführte Rundfahrt durch das Unterland",
    adultPrice: 11,
    childPrice: 6,
    capacity: 42,
    duration: "ca. 40 Minuten",
    description: "An Bord unserer Inselbahn gleiten Sie mit maximal 6 km/h durch das Unterland - vorbei an den legendären Hummerbuden, dem historischen Binnenhafen und dem Seenotrettungskreuzer Hermann Marwede.",
    highlights: [
      "Hafen, Landungsbrücke & Südstrandpromenade",
      "Hummerbuden & historischer Binnenhafen",
      "Hermann Marwede & AWI Meeresforschung",
      "Fotostopp im Nordostland mit Blick auf die Klippen von der Ostseite",
    ],
    wheelchair: true,
    dogs: true,
    accent: "amber" as const,
    illustration: "/images/inselbahn-illustration-unterland.svg",
    photo: "/images/unterland-main.jpg",
  },
];

const DEFAULT_MAX_FUTURE_DAYS = 30;

const STEPS = ["Datum", "Tour", "Zeit", "Pers.", "Rabatt", "Kontakt", "Zahlung"];

const COUNTRY_OPTIONS = [
  "Deutschland",
  "Österreich",
  "Schweiz",
  "Niederlande",
  "Belgien",
  "Dänemark",
  "Polen",
  "Frankreich",
  "Luxemburg",
  "Tschechien",
  "Vereinigtes Königreich",
  "Schweden",
  "Norwegen",
  "Italien",
  "Spanien",
];
const RESERVATION_SECONDS = 10 * 60; // 10 minutes

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
        return_url: window.location.origin + '/', // clean URL without hash fragment
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
          : `Jetzt bezahlen - ${totalPrice.toFixed(2).replace(".", ",")} \u20AC`}
      </button>
    </form>
  );
}

/* ─── Main Component ─── */
interface BookingWidgetProps {
  tours?: Array<{
    slug: string;
    name: string;
    description: string;
    duration_minutes: number;
    max_capacity: number;
    price_adult: number;
    price_child: number;
    highlights: string[];
    wheelchair_accessible: boolean;
    dogs_allowed: boolean;
    notes: string | null;
  }>;
}

export default function BookingWidget({ tours: supabaseTours }: BookingWidgetProps) {
  // Merge Supabase tour data with hardcoded UI config (illustrations, accents, etc.)
  const mergedTourOptions = tourOptions.map((opt) => {
    const dbTour = supabaseTours?.find(
      (t) => t.slug === opt.id || t.slug === opt.slug || t.name === opt.name
    );
    if (dbTour) {
      return {
        ...opt,
        adultPrice: Number(dbTour.price_adult),
        childPrice: Number(dbTour.price_child),
        capacity: dbTour.max_capacity,
        duration: `ca. ${dbTour.duration_minutes} Minuten`,
        highlights: dbTour.highlights?.length > 0 ? dbTour.highlights : opt.highlights,
        wheelchair: dbTour.wheelchair_accessible,
        dogs: dbTour.dogs_allowed,
      };
    }
    return opt;
  });
  const [maxFutureDays, setMaxFutureDays] = useState(DEFAULT_MAX_FUTURE_DAYS);
  const [seasonStart, setSeasonStart] = useState<string | null>(null);

  // Fetch settings from Supabase
  useEffect(() => {
    fetch('/api/settings?key=max_booking_days')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setMaxFutureDays(parseInt(d.value, 10)); })
      .catch(() => {});
    fetch('/api/settings?key=season_start')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setSeasonStart(d.value); })
      .catch(() => {});
  }, []);

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
  const [hinweiseAccepted, setHinweiseAccepted] = useState(false);
  const [wheelchairSeat, setWheelchairSeat] = useState(false);
  const [wheelchairAdult, setWheelchairAdult] = useState(0);
  const [wheelchairChild, setWheelchairChild] = useState(0);
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [invoiceCompany, setInvoiceCompany] = useState("");
  const [invoiceStreet, setInvoiceStreet] = useState("");
  const [invoicePostalCode, setInvoicePostalCode] = useState("");
  const [invoiceCity, setInvoiceCity] = useState("");
  const [invoiceVatId, setInvoiceVatId] = useState("");
  const [invoiceCountry, setInvoiceCountry] = useState("Deutschland");

  // Discount & Gift Card state
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

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

  // Filtered slots for selected tour (only online-bookable for interaction)
  const filteredSlots = useMemo(
    () => slots.filter((s) => s.tour_slug === selectedTour),
    [slots, selectedTour],
  );

  // Check which tours have ANY online-bookable departures for the selected date
  const tourHasOnlineBookable = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const opt of mergedTourOptions) {
      const tourSlots = slots.filter((s) => s.tour_slug === opt.id || s.tour_slug === opt.slug);
      result[opt.id] = tourSlots.some((s) => s.bookable_online && !s.past && !s.cancelled);
    }
    return result;
  }, [slots, mergedTourOptions]);

  // Check which tours have ANY departures at all (bookable or not) for the selected date
  const tourHasDepartures = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const opt of mergedTourOptions) {
      const tourSlots = slots.filter((s) => s.tour_slug === opt.id || s.tour_slug === opt.slug);
      result[opt.id] = tourSlots.some((s) => !s.past && !s.cancelled);
    }
    return result;
  }, [slots, mergedTourOptions]);

  // Check if ALL bookable departures for selected tour are sold out (excluding past and cancelled ones)
  const allSoldOut = useMemo(() => {
    const bookableSlots = filteredSlots.filter((s) => s.bookable_online && !s.past && !s.cancelled);
    return bookableSlots.length > 0 && bookableSlots.every((s) => s.remaining <= 0);
  }, [filteredSlots]);

  // Prices from the selected slot (API-driven)
  const adultPrice = selectedSlot?.price_adult ?? mergedTourOptions.find((t) => t.id === selectedTour)?.adultPrice ?? 0;
  const childPrice = selectedSlot?.price_child ?? mergedTourOptions.find((t) => t.id === selectedTour)?.childPrice ?? 0;
  const remaining = selectedSlot?.remaining ?? 20;

  const subtotalPrice = adultPrice * (adults + wheelchairAdult) + childPrice * (children + wheelchairChild);

  // Apply discount — round to nearest full euro for clean prices
  const discountAmount = useMemo(() => {
    if (!appliedDiscount) return 0;
    if (appliedDiscount.type === 'percentage') {
      const raw = subtotalPrice * appliedDiscount.value / 100;
      return Math.round(raw); // Round to full euro (2.2 → 2, 3.5 → 4)
    }
    return Math.min(appliedDiscount.value, subtotalPrice);
  }, [appliedDiscount, subtotalPrice]);

  const priceAfterDiscount = Math.max(0, subtotalPrice - discountAmount);

  // Apply gift card
  const giftCardDeduction = useMemo(() => {
    if (!appliedGiftCard) return 0;
    return Math.min(appliedGiftCard.remaining_value, priceAfterDiscount);
  }, [appliedGiftCard, priceAfterDiscount]);

  const totalPrice = Math.max(0, priceAfterDiscount - giftCardDeduction);
  const giftCardCoversAll = totalPrice === 0 && subtotalPrice > 0;

  /* ─── Listen for tour pre-selection from TourCards ─── */
  useEffect(() => {
    function handleSelectTour(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.tourId) {
        setSelectedTour(detail.tourId);
        setSelectedTime("");
        setSelectedSlot(null);
        // If date already selected, skip to step 2 (tour is already set, go to time)
        if (selectedDate) {
          setStep(2);
        } else {
          setStep(0);
        }
      }
    }
    window.addEventListener("booking:select-tour", handleSelectTour);
    return () => window.removeEventListener("booking:select-tour", handleSelectTour);
  }, [selectedDate]);

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
    if (countdownExpired && step === 6 && !paymentSuccess) {
      // Timer ran out — reservation expired
      setClientSecret(null);
      setReservationStart(null);
    }
  }, [countdownExpired, step, paymentSuccess]);

  /* ─── Auto-scroll to top of booking section on step change ─── */
  useEffect(() => {
    const el = document.getElementById('buchung');
    if (el && step > 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

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
      case 4:
        return true; // Rabatt step is always optional
      case 5: {
        const baseValid =
          contactName.trim() !== "" &&
          contactEmail.trim() !== "" &&
          contactPhone.trim() !== "" &&
          gdprConsent &&
          hinweiseAccepted &&
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
  }, [step, selectedDate, selectedTour, selectedTime, selectedSlot, adults, contactName, contactEmail, contactPhone, gdprConsent, hinweiseAccepted, submitting, wantsInvoice, invoiceCompany, invoiceStreet, invoicePostalCode, invoiceCity]);

  /* ─── Submit booking → get client_secret → go to payment step ─── */
  async function handleSubmit() {
    if (!selectedSlot) return;

    // Re-validate: check if departure is still in the future with enough time
    const berlinNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
    const todayBerlin = berlinNow.toISOString().slice(0, 10);
    if (selectedDate === todayBerlin && selectedTime) {
      const [depH, depM] = selectedTime.split(':').map(Number);
      const depMinutes = depH * 60 + depM;
      const nowMinutes = berlinNow.getHours() * 60 + berlinNow.getMinutes();
      if (depMinutes <= nowMinutes + 20) {
        setSubmitError('Diese Tour kann nicht mehr online gebucht werden. Die Abfahrt ist in weniger als 20 Minuten.');
        return;
      }
    }
    // Check season_start
    if (seasonStart && selectedDate < seasonStart) {
      setSubmitError('Buchungen sind erst ab dem ' + new Date(seasonStart + 'T00:00:00').toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }) + ' möglich.');
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departure_id: selectedSlot.departure_id,
          booking_date: selectedDate,
          adults: adults + wheelchairAdult,
          children: children + wheelchairChild,
          children_free: childrenFree,
          customer_name: contactName.trim(),
          customer_email: contactEmail.trim(),
          customer_phone: contactPhone.trim(),
          ...(wheelchairSeat ? { wheelchair_seat: true } : {}),
          ...(appliedGiftCard ? { gift_card_code: appliedGiftCard.code } : {}),
          ...(appliedDiscount ? { discount_code: appliedDiscount.code } : {}),
          ...(giftCardCoversAll ? { skip_payment: true } : {}),
          ...(wantsInvoice
            ? {
                invoice: {
                  company_name: invoiceCompany.trim(),
                  street: invoiceStreet.trim(),
                  postal_code: invoicePostalCode.trim(),
                  city: invoiceCity.trim(),
                  country: invoiceCountry,
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

      if (giftCardCoversAll || data.skip_payment) {
        // Gift card covers the full amount — no Stripe payment needed
        setBookingReference(data.booking_reference);
        setPaymentSuccess(true);
        return;
      }

      setClientSecret(data.client_secret);
      setBookingReference(data.booking_reference);
      setReservationStart(Date.now());
      setPaymentError("");
      setPaymentSuccess(false);
      setStep(6); // Go to payment step
    } catch {
      setSubmitError("Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    setSubmitError("");
    if (step < 5) {
      setStep(step + 1);
    } else if (step === 5) {
      handleSubmit();
    }
  }

  function handleBack() {
    setSubmitError("");
    if (step > 0 && step <= 5) setStep(step - 1);
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
    setInvoiceCountry("Deutschland");
    setWheelchairSeat(false);
    setWheelchairAdult(0);
    setWheelchairChild(0);
    setAppliedGiftCard(null);
    setAppliedDiscount(null);
    setClientSecret(null);
    setBookingReference("");
    setPaymentError("");
    setPaymentSuccess(false);
    setReservationStart(null);
    setSubmitError("");
  }

  function nextMonth() {
    // Don't go beyond maxFutureDays from today
    const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + maxFutureDays);
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

  const totalPassengers = adults + children + childrenFree + wheelchairAdult + wheelchairChild;
  const canAddMore = totalPassengers < remaining;

  // Wheelchair availability: only for wheelchair-accessible tours (Unterland)
  const selectedTourConfig = mergedTourOptions.find((t) => t.id === selectedTour);
  const isWheelchairTour = selectedTourConfig?.wheelchair === true;
  const wheelchairAvailable = selectedSlot?.wheelchair_available !== false;

  /* ─── Payment Success ─── */
  if (paymentSuccess) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-xl mx-auto animate-fade-in-up">
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-[28px] md:text-[36px] font-bold text-dark mb-2">
              Buchung bestätigt!
            </h2>
            <p className="text-dark/50 text-lg">
              Wir freuen uns auf Sie auf Helgoland! 🎉
            </p>
          </div>

          {/* Booking details card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark/50">Buchungsnummer</span>
              <span className="text-dark font-bold text-lg">{bookingReference}</span>
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
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
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
              <span className="text-xl font-bold text-dark">{totalPrice.toFixed(2).replace(".", ",")}&nbsp;€</span>
            </div>
          </div>

          {/* Email confirmation */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mt-5">
            <p className="text-green-800 text-sm">
              ✉️ Eine Bestätigung mit Ihrer Fahrkarte wurde an <strong>{contactEmail}</strong> gesendet.
              {wantsInvoice && " Die gewünschte Rechnung erhalten Sie ebenfalls per E-Mail."}
            </p>
          </div>

          {/* Meeting point reminder */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 mt-4 text-sm text-dark/60 space-y-1.5">
            <p className="font-medium text-dark/70"><a href="https://maps.app.goo.gl/NM5cejH96LjhS8n28" target="_blank" rel="noopener noreferrer" className="hover:underline">📍 Treffpunkt: Franz-Schensky-Platz</a></p>
            <p>Bitte seien Sie <strong>15 Minuten vor Abfahrt</strong> am Treffpunkt.</p>
            <p>🚻 Toilette im Gebäude der Landungsbrücke (kostenlos)</p>
          </div>

          {/* Self-service info */}
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5 space-y-3 text-sm">
            <p className="font-medium text-dark/70 text-base">Self-Service</p>
            <p className="text-dark/50">
              Bitte bewahren Sie Ihre Buchungsnummer <strong>{bookingReference}</strong> auf. Damit können Sie jederzeit:
            </p>
            <ul className="space-y-2 text-dark/50">
              <li className="flex items-start gap-2">
                <span>🎫</span>
                <span>Ihre <a href="/booking/invoice" className="text-primary underline underline-offset-2">Fahrkarte erneut herunterladen</a></span>
              </li>
              {!wantsInvoice && (
                <li className="flex items-start gap-2">
                  <span>🧾</span>
                  <span>Nachträglich eine <a href="/booking/invoice" className="text-primary underline underline-offset-2">Rechnung anfordern</a></span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span>❌</span>
                <span>Ihre Buchung <a href="/booking/cancel" className="text-primary underline underline-offset-2">kostenlos stornieren</a> (bis Mitternacht am Vortag)</span>
              </li>
            </ul>
          </div>

          {/* Tax note */}
          <p className="text-dark/30 text-xs mt-4 text-center">
            Alle Preise sind Endpreise. Gemäß §1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
          </p>

          {/* New booking button */}
          <div className="text-center mt-8">
            <button
              onClick={handleStartOver}
              className="px-8 py-3 rounded-full font-semibold bg-dark text-white hover:bg-dark/85 transition-colors"
            >
              Neue Buchung
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Timer expired on payment step ─── */
  if (step === 6 && countdownExpired && !paymentSuccess) {
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

  /* ─── Payment step (step 6) ─── */
  if (step === 6 && clientSecret) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-12 text-center">
            Online buchen
          </h2>

          {/* Progress bar */}
          <div className="max-w-2xl mx-auto mb-6 md:mb-10 overflow-x-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-2 min-w-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      i < step
                        ? "bg-primary text-white"
                        : i === step
                          ? "bg-dark text-white"
                          : "bg-dark/10 text-dark/40"
                    }`}
                  >
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`hidden sm:block w-8 md:w-14 h-0.5 mx-1 transition-colors ${
                        i < step ? "bg-primary" : "bg-dark/10"
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
                  className={`text-[10px] sm:text-xs text-center ${
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

            {/* Summary sidebar — hidden on mobile */}
            <div className="hidden lg:block lg:w-[320px] flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:sticky lg:top-32">
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
                    <span className="text-dark font-medium">{adults} &times; {adultPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                  </div>
                  {children > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Kinder (6–14)</span>
                      <span className="text-dark font-medium">{children} &times; {childPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                    </div>
                  )}
                  {childrenFree > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark/50">Kinder (0–5)</span>
                      <span className="text-dark font-medium">kostenlos</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Rabatt</span>
                      <span className="font-medium">&minus;{discountAmount.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                    </div>
                  )}
                  {giftCardDeduction > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Gutschein</span>
                      <span className="font-medium">&minus;{giftCardDeduction.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-dark font-medium">Gesamt</span>
                    <span className="text-2xl font-bold text-dark">{totalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                  </div>
                  <p className="text-dark/40 text-[10px] mt-2">
                    Alle Preise sind Endpreise. Gem&auml;&szlig; &sect;1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ─── Steps 0–5: Normal booking flow ─── */
  return (
    <section
      id="buchung"
      className="px-5 md:px-10 lg:px-20 py-12 md:py-20"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with subtle background */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-3">
            Online buchen
          </h2>
          <p className="text-dark/50 text-sm md:text-base max-w-lg mx-auto">
            In wenigen Schritten zu Ihrem Inselbahn-Erlebnis auf Helgoland
          </p>
        </div>

        {/* Progress bar — completed steps use primary color */}
        <div className="max-w-2xl mx-auto mb-6 md:mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between mb-2 min-w-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                    i < step
                      ? "bg-primary text-white"
                      : i === step
                        ? "bg-dark text-white"
                        : "bg-dark/10 text-dark/40"
                  }`}
                >
                  {i < step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 md:w-14 h-0.5 mx-1 transition-colors ${
                      i < step ? "bg-primary" : "bg-dark/10"
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
                className={`text-[10px] sm:text-xs text-center ${
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
          <div className="flex-1">
            <div>
              {/* Step 1: Date — compact calendar with dots, no tooltips */}
              <div className={`w-full px-1 ${step === 0 ? '' : 'hidden'}`}>
                <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm max-w-sm mx-auto">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="w-8 h-8 flex items-center justify-center hover:bg-dark/5 rounded-full transition-colors"
                      aria-label="Vorheriger Monat"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h3 className="text-base font-bold text-dark select-none">
                      {monthNames[calMonth]} {calYear}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="w-8 h-8 flex items-center justify-center hover:bg-dark/5 rounded-full transition-colors"
                      aria-label="Nächster Monat"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 gap-0 text-center mb-0.5">
                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                      <div key={d} className="text-[10px] font-semibold text-dark/40 uppercase tracking-wider py-1.5">{d}</div>
                    ))}
                  </div>

                  {/* Calendar grid — compact */}
                  <div className="grid grid-cols-7 gap-0">
                    {calDays.map((day, i) => {
                      if (day === null) return <div key={`empty-${i}`} className="aspect-square" />;
                      const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                      const dateObj = new Date(calYear, calMonth, day);
                      const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isPast = dateObj < todayObj;
                      const isToday = dateObj.getTime() === todayObj.getTime();
                      const isTooFar = dateObj.getTime() > todayObj.getTime() + maxFutureDays * 86400000;
                      const isBeforeSeason = seasonStart ? dateStr < seasonStart : false;
                      // Today after 18:00 Berlin time = no more tours, treat as past
                      const berlinHour = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin', hour: 'numeric', hour12: false });
                      const isTodayEvening = isToday && parseInt(berlinHour) >= 18;
                      const isDisabled = isPast || isTooFar || isBeforeSeason || isTodayEvening;
                      const isSelected = dateStr === selectedDate;
                      const isFuture = !isPast && !isTooFar;

                      return (
                        <div key={dateStr} className="flex items-center justify-center aspect-square p-0.5 relative">
                          <button
                            disabled={isDisabled}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`w-full h-full rounded-full text-sm font-medium transition-all relative flex flex-col items-center justify-center ${
                              isDisabled
                                ? "text-dark/15 cursor-not-allowed"
                                : isSelected
                                  ? "bg-primary text-white shadow-md"
                                  : isToday
                                    ? "text-dark ring-2 ring-primary ring-inset hover:bg-primary/5"
                                    : "text-dark hover:bg-dark/5"
                            }`}
                          >
                            <span>{day}</span>
                            {/* Green availability dot */}
                            {isFuture && !isSelected && (
                              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Compact legend */}
                  <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-[10px] text-dark/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-green" /> Verf&uuml;gbar
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-dark/40">
                      <span className="w-3 h-3 rounded-full ring-1.5 ring-primary" /> Heute
                    </span>
                  </div>
                  <p className="text-center text-xs text-dark/30 mt-3">
                    Online-Buchung ist bis zu {maxFutureDays} Tage im Voraus möglich.
                  </p>
                </div>
              </div>

              {/* Step 2: Tour — larger cards with SVG illustrations */}
              <div className={`w-full px-1 ${step === 1 ? '' : 'hidden'}`}>
                <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4 items-stretch">
                  {mergedTourOptions.map((t) => {
                    const isSelected = selectedTour === t.id;
                    const hasOnline = !selectedDate || tourHasOnlineBookable[t.id];
                    const hasDeps = !selectedDate || tourHasDepartures[t.id];
                    const isNotOnlineBookable = selectedDate && !hasOnline && hasDeps;
                    const isDisabledTour = selectedDate && !hasOnline;
                    return (
                      <button
                        key={t.id}
                        disabled={!!isDisabledTour}
                        onClick={() => {
                          if (isDisabledTour) return;
                          setSelectedTour(t.id);
                          setSelectedTime("");
                          setSelectedSlot(null);
                        }}
                        className={`w-full text-left rounded-2xl transition-all border-2 relative overflow-hidden flex flex-col ${
                          isDisabledTour
                            ? "border-gray-200 shadow-sm cursor-default"
                            : isSelected
                              ? "border-primary shadow-lg scale-[1.01]"
                              : "border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200"
                        }`}
                      >
                        {/* Photo header */}
                        <div className="relative w-full aspect-[16/8] sm:aspect-[16/9] overflow-hidden rounded-t-2xl">
                          <Image
                            src={t.photo}
                            alt={`${t.name} Foto`}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="p-4 md:p-6 flex flex-col flex-1">
                          {/* Badge for premium */}
                          {"badge" in t && t.badge && !isNotOnlineBookable && (
                            <span className="self-start bg-[#1a3a5c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                              {t.badge}
                            </span>
                          )}

                          {/* Not online bookable badge */}
                          {isNotOnlineBookable && (
                            <span className="self-start bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                              Aktuell nicht online buchbar
                            </span>
                          )}

                          {/* Tour name with inline SVG */}
                          <div className="flex items-center justify-between gap-3 mb-0.5">
                            <p className="text-xl font-bold text-dark">{t.name}</p>
                            <Image
                              src={t.illustration}
                              alt={`${t.name} Illustration`}
                              width={80}
                              height={32}
                              className="h-[32px] w-auto flex-shrink-0"
                            />
                          </div>
                          <p className="text-sm text-dark/50 mb-3">
                            {t.subtitle}
                          </p>

                          {/* Meta info row: duration, capacity, accessibility */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-dark/45 mb-3">
                            <span className="flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {t.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                              max. {t.capacity} Pers.
                            </span>
                            {t.wheelchair && (
                              <span className="flex items-center gap-1" title="Rollstuhlgerecht">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                                Barrierefrei
                              </span>
                            )}
                            {t.dogs && (
                              <span className="flex items-center gap-1" title="Hunde erlaubt">
                                Hunde OK
                              </span>
                            )}
                          </div>

                          {/* Highlights */}
                          <ul className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                            {t.highlights.map((h, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-dark/60">
                                <span className="text-green mt-0.5 font-bold text-[10px]">&#10003;</span>
                                {h}
                              </li>
                            ))}
                          </ul>

                          {/* Price — pushed to bottom */}
                          <div className="flex items-baseline gap-2 pt-3 border-t border-gray-100 mt-auto">
                            <span className="text-xl font-bold text-dark">ab {t.adultPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                            <span className="text-xs text-dark/40">
                              Erwachsene &middot; Kinder ab {t.childPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;
                            </span>
                          </div>

                          {/* Not online bookable notice */}
                          {isNotOnlineBookable && (
                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-dark/50">
                              Tickets vor Ort bei Tomek (11:30–14:30) oder beim Fahrer erh&auml;ltlich
                            </div>
                          )}
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Time (API-driven) with sold-out handling */}
              <div className={`w-full px-1 ${step === 2 ? '' : 'hidden'}`}>
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
                      <p className="text-dark/50 text-sm">Keine Abfahrten f&uuml;r diesen Tag verf&uuml;gbar.</p>
                    </div>
                  ) : allSoldOut ? (
                    /* All departures sold out for this tour+date */
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                      <div className="flex justify-center mb-4">
                        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-dark mb-2">Leider ausgebucht f&uuml;r dieses Datum</h3>
                      <p className="text-sm text-dark/50 mb-6">
                        Alle Online-Abfahrten f&uuml;r die {mergedTourOptions.find(t => t.id === selectedTour)?.name || "Tour"} sind an diesem Tag leider vergeben.
                      </p>
                      <button
                        onClick={() => setStep(0)}
                        className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors mb-4"
                      >
                        Anderes Datum w&auml;hlen
                      </button>
                      <p className="text-xs text-dark/40 mt-4">
                        Tipp: Versuchen Sie auch vor Ort bei unserem Ticketverk&auml;ufer Tomek (11:30–14:30 Uhr)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {filteredSlots.map((slot) => {
                        const time = formatTime(slot.departure_time);
                        const isSlotSelected = selectedSlot?.departure_id === slot.departure_id;
                        const soldOut = slot.remaining <= 0;
                        const notBookableOnline = !slot.bookable_online;
                        const isPast = !!slot.past;
                        const isCancelled = !!slot.cancelled;
                        const isDisabledSlot = soldOut || notBookableOnline || isPast || isCancelled;
                        const tourOpt = mergedTourOptions.find(t => t.id === selectedTour);
                        const isAmber = tourOpt?.accent === "amber";

                        // Capacity percentage
                        const capacityPercent = slot.max_capacity > 0 ? (slot.booked / slot.max_capacity) * 100 : 0;
                        const remainingPercent = 100 - capacityPercent;
                        // Color for remaining text
                        const remainColor = isPast || !slot.bookable_online || isCancelled
                          ? "text-dark/30"
                          : soldOut
                            ? "text-red-400"
                            : remainingPercent > 50
                              ? "text-green"
                              : remainingPercent > 25
                                ? "text-amber-600"
                                : "text-red-500";

                        return (
                          <button
                            key={slot.departure_id}
                            disabled={isDisabledSlot}
                            onClick={() => {
                              setSelectedTime(time);
                              setSelectedSlot(slot);
                            }}
                            className={`w-full text-left px-5 py-4 rounded-2xl text-base font-medium transition-all border-2 ${
                              isPast
                                ? "bg-gray-50 text-dark/30 border-gray-100 cursor-not-allowed"
                                : notBookableOnline
                                  ? "bg-gray-50 text-dark/30 border-gray-100 cursor-not-allowed"
                                  : soldOut
                                    ? "bg-gray-50 text-dark/30 border-gray-100 cursor-not-allowed"
                                    : isSlotSelected
                                      ? "bg-white text-dark border-primary shadow-md"
                                      : `bg-white text-dark shadow-sm hover:shadow-md ${
                                          isAmber ? "border-amber-200 hover:border-amber-300" : "border-[#c5d4e3] hover:border-[#1a3a5c]"
                                        }`
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={isPast || notBookableOnline ? "text-dark/30" : ""}>{time} Uhr</span>
                                {isCancelled && (
                                  <span className="text-[10px] font-bold uppercase bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">F&auml;llt aus</span>
                                )}
                                {!isCancelled && soldOut && slot.bookable_online && !slot.online_sold_out && (
                                  <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ausgebucht</span>
                                )}
                                {!isCancelled && slot.online_sold_out && (
                                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">online ausgebucht</span>
                                )}
                              </div>
                              <span className={`text-sm ${remainColor}`}>
                                {isPast || notBookableOnline
                                  ? ""
                                  : soldOut
                                    ? ""
                                    : `noch ${slot.remaining} ${slot.remaining === 1 ? "Platz" : "Pl\u00E4tze"}`}
                              </span>
                            </div>

                            {/* Capacity progress bar */}
                            {slot.bookable_online && !isPast && (
                              <div className="w-full h-1.5 bg-dark/5 rounded-full overflow-hidden mb-1.5">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    soldOut
                                      ? "bg-red-300"
                                      : remainingPercent > 50
                                        ? "bg-green"
                                        : remainingPercent > 25
                                          ? "bg-amber-400"
                                          : "bg-red-400"
                                  }`}
                                  style={{ width: `${capacityPercent}%` }}
                                />
                              </div>
                            )}

                            {/* Past departure notice */}
                            {isPast && (
                              <p className="text-xs text-dark/35 mt-1">
                                Nicht mehr online buchbar - {slot.booked} von {slot.max_capacity} Pl&auml;tze gebucht
                              </p>
                            )}

                            {/* Non-bookable notice (ab Schiff) */}
                            {!isPast && notBookableOnline && (
                              <p className="text-xs text-dark/35 mt-1">
                                Abfahrt nach Schiffsankunft ab Hafen - Uhrzeit nur Sch&auml;tzung, Tickets nur beim Fahrer
                              </p>
                            )}

                            {/* Online sold out but walk-up possible (not for cancelled departures) */}
                            {slot.online_sold_out && !isPast && slot.bookable_online && !isCancelled && (
                              <p className="text-xs text-amber-600 mt-1">
                                Online ausgebucht - Restpl&auml;tze ggf. vor Ort bei Tomek (11:30-14:30) oder beim Fahrer
                              </p>
                            )}

                            {/* Cancelled departure notice */}
                            {isCancelled && !isPast && (
                              <p className="text-xs text-gray-400 mt-1">
                                Diese Abfahrt wurde abgesagt.
                              </p>
                            )}

                            {slot.departure_notes && slot.bookable_online && (
                              <p className={`text-xs mt-0.5 ${isSlotSelected ? "text-dark/50" : "text-dark/40"}`}>
                                {slot.departure_notes}
                              </p>
                            )}

                            {/* Selected indicator */}
                            {isSlotSelected && (
                              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 4: Passengers */}
              <div className={`w-full px-1 ${step === 3 ? '' : 'hidden'}`}>
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  {/* Seat info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                    💺 Unsere Sitze sind ca. 50 cm breit.
                  </div>
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Erwachsene</p>
                      <p className="text-sm text-dark/50">{adultPrice.toFixed(2).replace(".", ",")}&nbsp;&euro; pro Person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-11 h-11 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{adults}</span>
                      <button onClick={() => canAddMore && setAdults(adults + 1)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Children 6-14 (paid) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Kinder 6–14</p>
                      <p className="text-sm text-dark/50">{childPrice.toFixed(2).replace(".", ",")}&nbsp;&euro; pro Kind</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-11 h-11 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{children}</span>
                      <button onClick={() => canAddMore && setChildren(children + 1)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Children 0-5 (free) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Kinder 0–5</p>
                      <p className="text-sm text-dark/50">kostenlos</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildrenFree(Math.max(0, childrenFree - 1))} className="w-11 h-11 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{childrenFree}</span>
                      <button onClick={() => canAddMore && setChildrenFree(childrenFree + 1)} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${canAddMore ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                    </div>
                  </div>

                  {/* Wheelchair seats (Unterland only) — max 1 total */}
                  {isWheelchairTour && (
                    <>
                      <div className="border-t border-gray-100 pt-3 mt-1">
                        <p className="text-xs font-semibold text-dark/40 uppercase tracking-wider mb-3">
                          ♿ Rollstuhlplatz {wheelchairAvailable
                            ? <span className="text-green-600 normal-case">(1 verfügbar)</span>
                            : <span className="text-red-500 normal-case">(bereits vergeben)</span>}
                        </p>
                      </div>
                      {/* Wheelchair Adult */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-dark">Rollstuhl Erwachsener</p>
                          <p className="text-sm text-dark/50">{selectedSlot ? `${Number(selectedSlot.price_adult).toFixed(2).replace('.', ',')} €` : ''}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => { setWheelchairAdult(0); setWheelchairSeat(wheelchairChild > 0); }} disabled={wheelchairAdult === 0} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${wheelchairAdult > 0 ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>&minus;</button>
                          <span className="text-xl font-bold w-6 text-center">{wheelchairAdult}</span>
                          <button onClick={() => { if (wheelchairAvailable && wheelchairAdult + wheelchairChild < 1) { setWheelchairAdult(1); setWheelchairChild(0); setWheelchairSeat(true); } }} disabled={!wheelchairAvailable || wheelchairAdult + wheelchairChild >= 1} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${wheelchairAvailable && wheelchairAdult + wheelchairChild < 1 ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                        </div>
                      </div>
                      {/* Wheelchair Child */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-dark">Rollstuhl Kind (6–14)</p>
                          <p className="text-sm text-dark/50">{selectedSlot ? `${Number(selectedSlot.price_child).toFixed(2).replace('.', ',')} €` : ''}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => { setWheelchairChild(0); setWheelchairSeat(wheelchairAdult > 0); }} disabled={wheelchairChild === 0} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${wheelchairChild > 0 ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>&minus;</button>
                          <span className="text-xl font-bold w-6 text-center">{wheelchairChild}</span>
                          <button onClick={() => { if (wheelchairAvailable && wheelchairAdult + wheelchairChild < 1) { setWheelchairChild(1); setWheelchairAdult(0); setWheelchairSeat(true); } }} disabled={!wheelchairAvailable || wheelchairAdult + wheelchairChild >= 1} className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors text-lg ${wheelchairAvailable && wheelchairAdult + wheelchairChild < 1 ? "bg-dark/5 text-dark hover:bg-dark/10" : "bg-dark/5 text-dark/20 cursor-not-allowed"}`}>+</button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Capacity note */}
                  <p className="text-xs text-dark/40 text-center">
                    {remaining - totalPassengers > 0
                      ? `Noch ${remaining - totalPassengers} ${remaining - totalPassengers === 1 ? 'Platz' : 'Plätze'} verfügbar`
                      : 'Alle verfügbaren Plätze ausgewählt'}
                  </p>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    {adults > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">{adults} &times; Erwachsene</span>
                        <span className="text-dark">{(adults * adultPrice).toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    {children > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">{children} &times; Kinder (6–14)</span>
                        <span className="text-dark">{(children * childPrice).toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    {childrenFree > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">{childrenFree} &times; Kinder (0–5)</span>
                        <span className="text-dark">kostenlos</span>
                      </div>
                    )}
                    {wheelchairAdult > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">♿ {wheelchairAdult} &times; Rollstuhl Erw.</span>
                        <span className="text-dark">{(wheelchairAdult * adultPrice).toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    {wheelchairChild > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-dark/60">♿ {wheelchairChild} &times; Rollstuhl Kind</span>
                        <span className="text-dark">{(wheelchairChild * childPrice).toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-dark font-medium">Gesamt</p>
                      <p className="text-2xl font-bold text-dark">{subtotalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Rabatt / Gutschein */}
              <div className={`w-full px-1 ${step === 4 ? '' : 'hidden'}`}>
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-dark mb-1">Gutschein &amp; Rabatt</h3>
                  <p className="text-sm text-dark/50 mb-5">
                    Haben Sie einen Gutschein- oder Rabattcode? Geben Sie ihn hier ein. Dieser Schritt ist optional.
                  </p>
                  <DiscountGiftSection
                    onGiftCardApplied={(gc) => setAppliedGiftCard(gc)}
                    onDiscountApplied={(d) => setAppliedDiscount(d)}
                    departureId={selectedSlot?.departure_id}
                  />
                  {(discountAmount > 0 || giftCardDeduction > 0) && (
                    <div className="mt-6 border-t border-gray-100 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-dark/60">
                        <span>Zwischensumme</span>
                        <span>{subtotalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Rabatt ({appliedDiscount?.type === "percentage" ? `${appliedDiscount.value}%` : "Festbetrag"})</span>
                          <span>&minus;{discountAmount.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                        </div>
                      )}
                      {giftCardDeduction > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Gutschein</span>
                          <span>&minus;{giftCardDeduction.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-dark pt-1 border-t border-gray-100">
                        <span>Zu zahlen</span>
                        <span>{totalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                      {giftCardCoversAll && (
                        <p className="text-green-700 text-xs mt-1">
                          Der Gutschein deckt den gesamten Betrag. Es ist keine Zahlung erforderlich.
                        </p>
                      )}
                      {giftCardCoversAll && appliedGiftCard && (appliedGiftCard.remaining_value - giftCardDeduction) > 0 && (
                        <p className="text-dark/50 text-xs mt-1">
                          Restguthaben von {(appliedGiftCard.remaining_value - giftCardDeduction).toFixed(2).replace(".", ",")}&nbsp;&euro; bleibt auf Ihrem Gutschein erhalten
                          {appliedGiftCard.expires_at ? ` und ist bis ${new Date(appliedGiftCard.expires_at).toLocaleDateString("de-DE")} g\u00FCltig` : ""}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 6: Contact */}
              <div className={`w-full px-1 ${step === 5 ? '' : 'hidden'}`}>
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
                  {/* Wichtige Hinweise */}
                  <div className="pt-2">
                    <p className="text-sm font-semibold text-dark mb-2">Wichtige Hinweise</p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={hinweiseAccepted} onChange={(e) => setHinweiseAccepted(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-dark" />
                      <span className="text-sm text-dark/60">
                        Ich best&auml;tige, dass ich die folgenden Hinweise gelesen habe:
                      </span>
                    </label>
                    <ul className="mt-2 ml-7 space-y-1.5 text-xs text-dark/50 list-disc pl-4">
                      <li>Bitte 15 Minuten vor Abfahrt am Franz-Schensky-Platz sein</li>
                      <li>Hunde: Nur bei der Unterland-Tour (bis mittlere Gr&ouml;&szlig;e, angeleint). Keine Hunde bei der Premium-Tour.</li>
                      <li>Rollst&uuml;hle: 1 Platz bei der Unterland-Tour (kein E-Rollstuhl). Premium-Tour nicht vollst&auml;ndig barrierefrei.</li>
                      <li>Gep&auml;ck: Kann nicht mitgenommen werden</li>
                      <li>Bei der letzten Fahrt des Tages ist ein Ausstieg am Schiff auf Anfrage beim Fahrer m&ouml;glich</li>
                      <li>Stornierung: Kostenlos bis Mitternacht am Vortag</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} className="mt-1 w-4 h-4 rounded accent-dark" />
                      <span className="text-sm text-dark/60">
                        Ich akzeptiere die{" "}
                        <a href="/agb" target="_blank" className="underline text-dark">AGB</a>{" "}
                        und{" "}
                        <a href="/agb#stornierung" target="_blank" className="underline text-dark">Stornierungsbedingungen</a>{" "}
                        und stimme der Verarbeitung meiner Daten gem&auml;&szlig; der{" "}
                        <a href="/datenschutz" target="_blank" className="underline text-dark">Datenschutzerkl&auml;rung</a>{" "}
                        zu.
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-dark/40 pl-7">
                    Hinweis: Bei Freizeitveranstaltungen mit festem Termin besteht kein Widerrufsrecht (&sect;312g Abs. 2 Nr. 9 BGB).
                  </p>

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
                        <input type="text" value={invoiceStreet} onChange={(e) => setInvoiceStreet(e.target.value)} placeholder="Musterstraße 1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
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
                        <label className="block text-sm font-medium text-dark mb-1.5">Land</label>
                        <select value={invoiceCountry} onChange={(e) => setInvoiceCountry(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent">
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">USt-IdNr. <span className="text-dark/40 font-normal">(optional)</span></label>
                        <input type="text" value={invoiceVatId} onChange={(e) => setInvoiceVatId(e.target.value)} placeholder="DE123456789" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-transparent" />
                      </div>
                    </div>
                  )}

                  {/* Tax-free notice */}
                  <p className="text-xs text-dark/40 pt-2">
                    Alle Preise sind Endpreise. Gem&auml;&szlig; &sect;1 Abs. 2 UStG wird keine Umsatzsteuer erhoben (Helgoland).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary sidebar — hidden on mobile, sticky on desktop */}
          <div className="hidden lg:block lg:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:sticky lg:top-32">
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
                      <span className="text-dark font-medium">{adults} &times; {adultPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark/50">Kinder (6–14)</span>
                        <span className="text-dark font-medium">{children} &times; {childPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    {childrenFree > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark/50">Kinder (0–5)</span>
                        <span className="text-dark font-medium">kostenlos</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Rabatt</span>
                        <span className="font-medium">&minus;{discountAmount.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                    {giftCardDeduction > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Gutschein</span>
                        <span className="font-medium">&minus;{giftCardDeduction.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {step >= 3 && (
                <div className="border-t border-gray-100 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-dark font-medium">Gesamt</span>
                    <span className="text-2xl font-bold text-dark">{totalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons — sticky on mobile */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 py-3 px-5 -mx-5 md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:py-0 md:px-0 md:mx-0 md:mt-8 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`px-5 sm:px-6 py-3 min-h-[44px] rounded-full font-medium transition-colors ${
                step === 0 ? "text-dark/20 cursor-not-allowed" : "text-dark hover:bg-dark/5"
              }`}
            >
              Zur&uuml;ck
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`px-6 sm:px-8 py-3 min-h-[44px] rounded-full font-semibold transition-colors flex items-center justify-center gap-2 ${
                canProceed
                  ? "bg-dark text-white hover:bg-dark/85"
                  : "bg-dark/10 text-dark/30 cursor-not-allowed"
              }`}
            >
              {submitting && <Spinner className="w-5 h-5" />}
              {step === 5 ? (giftCardCoversAll ? "Jetzt buchen" : "Zur Kasse") : "Weiter"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
