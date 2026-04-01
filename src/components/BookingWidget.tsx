"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

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
  },
  {
    id: "premium",
    name: "Premium-Tour",
    subtitle: "~90 Min",
    adultPrice: 22,
    childPrice: 15,
  },
];

const steps = ["Datum", "Tour", "Uhrzeit", "Personen", "Kontakt"];

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

/* ─── Component ─── */
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

  // Availability state
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string>("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [redirecting, setRedirecting] = useState(false);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const calDays = generateCalendarDays(calYear, calMonth);

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
        return (
          contactName.trim() !== "" &&
          contactEmail.trim() !== "" &&
          contactPhone.trim() !== "" &&
          gdprConsent &&
          !submitting
        );
      default:
        return false;
    }
  }, [step, selectedDate, selectedTour, selectedTime, selectedSlot, adults, contactName, contactEmail, contactPhone, gdprConsent, submitting]);

  /* ─── Submit booking ─── */
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
        }),
      });

      if (res.status === 409) {
        setSubmitError("Diese Abfahrt ist leider ausgebucht. Bitte wählen Sie eine andere Zeit.");
        setStep(2);
        setSelectedTime("");
        setSelectedSlot(null);
        // Refresh availability
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
      setRedirecting(true);
      window.location.href = data.checkout_url;
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
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    setSubmitError("");
    if (step > 0) setStep(step - 1);
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
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
    // "14:00:00" → "14:00"
    return t.slice(0, 5);
  }

  const totalPassengers = adults + children + childrenFree;
  const canAddMore = totalPassengers < remaining;

  /* ─── Redirecting state ─── */
  if (redirecting) {
    return (
      <section id="buchung" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <Spinner className="w-12 h-12 text-dark" />
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-4">
            Weiterleitung zur Zahlung...
          </h2>
          <p className="text-dark/60 text-lg">
            Sie werden in Kürze zu unserem Zahlungsanbieter weitergeleitet.
          </p>
        </div>
      </section>
    );
  }

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
            {steps.map((s, i) => (
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
                {i < steps.length - 1 && (
                  <div
                    className={`hidden sm:block w-12 md:w-20 h-0.5 mx-1 transition-colors ${
                      i < step ? "bg-dark" : "bg-dark/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((s, i) => (
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
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-dark/5 rounded-full transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <h3 className="text-lg font-bold">
                      {monthNames[calMonth]} {calYear}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-dark/5 rounded-full transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                      <div key={d} className="text-xs text-dark/40 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calDays.map((day, i) => {
                      if (day === null) return <div key={`empty-${i}`} />;
                      const dateStr = `${calYear}-${(calMonth + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                      const isPast = new Date(calYear, calMonth, day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                      const isSelected = dateStr === selectedDate;
                      return (
                        <button
                          key={dateStr}
                          disabled={isPast}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`h-10 rounded-full text-sm transition-colors ${
                            isPast
                              ? "text-dark/20 cursor-not-allowed"
                              : isSelected
                                ? "bg-dark text-white"
                                : "text-dark hover:bg-dark/5"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Tour */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto space-y-4">
                  {tourOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTour(t.id);
                        setSelectedTime("");
                        setSelectedSlot(null);
                      }}
                      className={`w-full text-left rounded-2xl p-6 transition-all border ${
                        selectedTour === t.id
                          ? "bg-dark text-white border-dark shadow-lg"
                          : "bg-white text-dark border-gray-100 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <p className="text-xl font-bold">{t.name}</p>
                      <p className={`text-sm ${selectedTour === t.id ? "text-white/70" : "text-dark/50"}`}>
                        {t.subtitle} &middot; ab {t.adultPrice}&euro;
                      </p>
                    </button>
                  ))}
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
                        Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                        <a href="#" className="underline text-dark">Datenschutzerklärung</a>{" "}
                        zu.
                      </span>
                    </label>
                  </div>
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
                      {new Date(selectedDate).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
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
