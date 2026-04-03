"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import WeatherWidget from "./WeatherWidget";
import type { Tour, DepartureWithTour } from "@/lib/tours";

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

/** Map tour slugs to schedule photos */
const SCHEDULE_PHOTOS: Record<string, { src: string; alt: string }> = {
  "unterland-tour": { src: "/images/helgolandbahn-photo-1.jpg", alt: "Unterland-Tour Inselbahn" },
  "premium-tour": { src: "/images/helgolandbahn-photo-2.jpg", alt: "Premium-Tour Inselbahn" },
};

const DEFAULT_PHOTO = { src: "/images/helgolandbahn-photo-1.jpg", alt: "Inselbahn Tour" };

function formatTime(timeStr: string): string {
  // departure_time is "HH:MM:SS" or "HH:MM" — display as "HH:MM Uhr"
  return timeStr.slice(0, 5) + " Uhr";
}

interface ScheduleProps {
  tours: Tour[];
  departures: DepartureWithTour[];
}

export default function Schedule({ tours, departures }: ScheduleProps) {
  // Group departures by tour
  const departuresByTour = new Map<string, DepartureWithTour[]>();
  for (const dep of departures) {
    const tourId = dep.tour_id;
    if (!departuresByTour.has(tourId)) {
      departuresByTour.set(tourId, []);
    }
    departuresByTour.get(tourId)!.push(dep);
  }

  return (
    <section id="fahrplan" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <SectionPill label="Abfahrtszeiten" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark leading-tight">
            Der aktuelle Fahrplan
          </h2>
          <p className="text-dark/50 text-sm mt-2 md:mt-0">
            Aktualisiert im August 2026
          </p>
        </div>

        {/* Countdown Timer + Weather */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <CountdownTimer />
          <WeatherWidget />
        </div>

        {/* Tour schedule rows */}
        {tours.map((tour) => {
          const tourDepartures = departuresByTour.get(tour.id) || [];
          const photo = SCHEDULE_PHOTOS[tour.slug] || DEFAULT_PHOTO;

          return (
            <div key={tour.id} className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-dark uppercase tracking-wide mb-5">
                  {tour.name}
                </h3>
                <div className="space-y-3 mb-6">
                  {tourDepartures.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between">
                      <span className="text-dark font-semibold text-lg">
                        {dep.notes ? `(${formatTime(dep.departure_time)})` : formatTime(dep.departure_time)}
                      </span>
                      <span className="text-dark/50 text-sm">
                        {dep.notes || "Abfahrt"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dark/10 pt-4">
                  <p className="text-dark/60 text-sm">
                    Erwachsene: <span className="font-semibold text-dark">{tour.price_adult}&euro;</span> &middot;
                    Kinder (unter {tour.child_age_limit}): <span className="font-semibold text-dark">{tour.price_child}&euro;</span>
                  </p>
                </div>
              </div>
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          );
        })}

        <div className="text-center space-y-2 mt-4">
          <p className="text-sm text-dark/50">
            *Bei den letzten Fahrten des Tages ist ein Ausstieg am Hafen m&ouml;glich, damit Sie Ihr Schiff rechtzeitig erreichen.
          </p>
          <p className="text-sm font-medium text-dark/70">
            Kinder unter 6 Jahren fahren kostenlos.
          </p>
        </div>
      </div>
    </section>
  );
}
