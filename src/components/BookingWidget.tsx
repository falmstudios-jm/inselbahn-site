"use client";

import { useState, useMemo } from "react";

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

const timeSlots: Record<string, string[]> = {
  unterland: ["13:30", "14:30"],
  premium: ["11:00", "12:15", "13:15", "14:00", "15:00", "16:00"],
};

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

export default function BookingWidget() {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const calDays = generateCalendarDays(calYear, calMonth);

  const tour = tourOptions.find((t) => t.id === selectedTour);
  const totalPrice = tour
    ? tour.adultPrice * adults + tour.childPrice * children
    : 0;

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return selectedDate !== "";
      case 1:
        return selectedTour !== "";
      case 2:
        return selectedTime !== "";
      case 3:
        return adults > 0;
      case 4:
        return (
          contactName.trim() !== "" &&
          contactEmail.trim() !== "" &&
          contactPhone.trim() !== "" &&
          gdprConsent
        );
      default:
        return false;
    }
  }, [step, selectedDate, selectedTour, selectedTime, adults, contactName, contactEmail, contactPhone, gdprConsent]);

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      console.log("Booking submitted:", {
        date: selectedDate,
        tour: selectedTour,
        time: selectedTime,
        adults,
        children,
        contactName,
        contactEmail,
        contactPhone,
      });
      setConfirmed(true);
    }
  }

  function handleBack() {
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

  if (confirmed) {
    return (
      <section
        id="buchung"
        className="px-5 md:px-10 lg:px-20 py-20 md:py-28"
      >
        <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4CAF50"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-4">
            Buchung bestätigt!
          </h2>
          <p className="text-dark/60 text-lg">
            Vielen Dank! Sie erhalten eine Bestätigung per E-Mail.
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

              {/* Step 3: Time */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {(timeSlots[selectedTour] || []).map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`px-6 py-3 rounded-full text-base font-medium transition-all border ${
                          selectedTime === time
                            ? "bg-dark text-white border-dark shadow-md"
                            : "bg-white text-dark border-gray-100 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {time} Uhr
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 4: Passengers */}
              <div className="w-full flex-shrink-0 px-1">
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Erwachsene</p>
                      <p className="text-sm text-dark/50">{tour?.adultPrice}&euro; pro Person</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{adults}</span>
                      <button onClick={() => setAdults(Math.min(20, adults + 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-dark">Kinder (unter 15)</p>
                      <p className="text-sm text-dark/50">{tour?.childPrice}&euro; pro Kind</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">&minus;</button>
                      <span className="text-xl font-bold w-6 text-center">{children}</span>
                      <button onClick={() => setChildren(Math.min(20, children + 1))} className="w-10 h-10 rounded-full bg-dark/5 flex items-center justify-center text-dark hover:bg-dark/10 transition-colors text-lg">+</button>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between">
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
                {tour && (
                  <div className="flex justify-between">
                    <span className="text-dark/50">Tour</span>
                    <span className="text-dark font-medium">{tour.name}</span>
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
                      <span className="text-dark font-medium">{adults} &times; {tour?.adultPrice}&euro;</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark/50">Kinder</span>
                        <span className="text-dark font-medium">{children} &times; {tour?.childPrice}&euro;</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {tour && step >= 3 && (
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
            className={`px-8 py-3 rounded-full font-semibold transition-colors ${
              canProceed
                ? "bg-dark text-white hover:bg-dark/85"
                : "bg-dark/10 text-dark/30 cursor-not-allowed"
            }`}
          >
            {step === 4 ? "Zur Kasse" : "Weiter"}
          </button>
        </div>
      </div>
    </section>
  );
}
