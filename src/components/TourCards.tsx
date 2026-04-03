"use client";

import { useCallback } from "react";
import Image from "next/image";
import type { Tour } from "@/lib/tours";

/** Map tour slugs to the BookingWidget tour IDs */
const SLUG_TO_BOOKING_ID: Record<string, string> = {
  "unterland-tour": "unterland",
  "premium-tour": "premium",
};

const galleryRow1 = [
  { src: "/images/tour-photo-1.jpg", alt: "Helgoland Klippen" },
  { src: "/images/helgolandbahn-photo-1.jpg", alt: "Inselbahn am Hafen" },
  { src: "/images/abfahrt-inselbahn.jpg", alt: "Abfahrt der Inselbahn" },
];

const galleryRow2 = [
  { src: "/images/helgolandbahn-photo-2.jpg", alt: "Fahrgäste in der Inselbahn" },
  { src: "/images/tour-photo-2.jpg", alt: "Premium-Tour Aussicht" },
  { src: "/images/tour-photo-1.jpg", alt: "Helgoland Natur" },
  { src: "/images/helgolandbahn-photo-1.jpg", alt: "Inselbahn vor Häusern" },
];

/** Map tour slugs to their illustration and photo assets */
const TOUR_ASSETS: Record<string, { illustration: string; illustrationAlt: string; photo: string; photoAlt: string }> = {
  "unterland-tour": {
    illustration: "/images/inselbahn-illustration-unterland.svg",
    illustrationAlt: "Illustration der Unterland-Tour",
    photo: "/images/helgolandbahn-photo-1.jpg",
    photoAlt: "Inselbahn Unterland-Tour",
  },
  "premium-tour": {
    illustration: "/images/inselbahn-illustration-premium.svg",
    illustrationAlt: "Illustration der Premium-Tour",
    photo: "/images/helgolandbahn-photo-2.jpg",
    photoAlt: "Inselbahn Premium-Tour",
  },
};

const DEFAULT_ASSETS = {
  illustration: "/images/inselbahn-illustration-unterland.svg",
  illustrationAlt: "Illustration der Tour",
  photo: "/images/helgolandbahn-photo-1.jpg",
  photoAlt: "Inselbahn Tour",
};

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-dark/70">
      <span className="text-green mt-0.5 font-bold">&#10003;</span>
      {text}
    </li>
  );
}

function TourCard({ tour, onBook }: { tour: Tour; onBook: (tourSlug: string) => void }) {
  const assets = TOUR_ASSETS[tour.slug] || DEFAULT_ASSETS;

  const capacityLabel = tour.wheelchair_accessible
    ? `${tour.max_capacity} Personen + 1 Rollstuhl`
    : `Kleingruppe (max. ${tour.max_capacity} Pers.)`;

  return (
    <div>
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-5">
        <Image
          src={assets.photo}
          alt={assets.photoAlt}
          fill
          className="object-cover"
        />
      </div>

      {/* Title with inline SVG */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-2xl md:text-[28px] font-bold text-dark">
          {tour.name}
        </h3>
        <Image
          src={assets.illustration}
          alt={assets.illustrationAlt}
          width={80}
          height={40}
          className="h-[40px] w-auto flex-shrink-0"
        />
      </div>
      {tour.notes && !/Fahrzeug/i.test(tour.notes) && (
        <p className="text-dark/50 text-sm mb-3">
          {tour.notes}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 mb-3 text-xs text-dark/50 uppercase tracking-wide font-medium flex-wrap">
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {tour.duration_minutes} Minuten
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          {capacityLabel}
        </span>
        {!tour.dogs_allowed && (
          <span className="flex items-center gap-1 text-dark/40 normal-case" title="Keine Hunde erlaubt">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><circle cx="12" cy="12" r="10"/></svg>
            Keine Hunde
          </span>
        )}
      </div>

      <p className="text-dark/60 text-sm leading-relaxed mb-4">
        {tour.description}
      </p>

      <ul className="space-y-2 mb-5">
        {tour.highlights.map((highlight, i) => (
          <CheckItem key={i} text={highlight} />
        ))}
      </ul>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold text-dark">ab {Number(tour.price_adult).toFixed(2).replace('.', ',')}&nbsp;&euro;</span>
        <span className="text-dark/50 text-sm">Erwachsene</span>
      </div>
      <p className="text-dark/50 text-sm mb-5">
        {Number(tour.price_child).toFixed(2).replace('.', ',')}&nbsp;&euro; Kinder (unter {tour.child_age_limit})
      </p>

      {/* Buchen button */}
      <button
        onClick={() => onBook(tour.slug)}
        data-tour={tour.slug}
        className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
      >
        {tour.name} buchen
      </button>
    </div>
  );
}

interface TourCardsProps {
  tours: Tour[];
}

export default function TourCards({ tours }: TourCardsProps) {
  const handleBook = useCallback((tourSlug: string) => {
    const bookingId = SLUG_TO_BOOKING_ID[tourSlug] || tourSlug;
    // Dispatch custom event so BookingWidget can pre-select the tour
    window.dispatchEvent(
      new CustomEvent("booking:select-tour", { detail: { tourId: bookingId } })
    );
    // Scroll to the booking widget
    const el = document.getElementById("buchung");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section id="touren">
      {/* ===== ZU WENIG ZEIT SECTION ===== */}
      <div className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Text */}
            <div>
              <SectionPill label="Warum gibt es die Inselbahn" />
              <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-6 leading-tight">
                Zu wenig Zeit für zu viele Eindrücke?
              </h2>
              <p className="text-dark/60 text-base md:text-lg leading-relaxed">
                Helgoland hat so viel zu bieten, aber als Tagesgast bleibt oft wenig
                Zeit. Mit unseren geführten Inselbahn-Touren sehen Sie alle
                Highlights bequem und entspannt &mdash; ohne anstrengende Wege,
                ohne etwas zu verpassen. Lehnen Sie sich zurück und genießen Sie
                die Insel aus einer ganz neuen Perspektive.
              </p>
            </div>
            {/* Right: Photo */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
              <Image
                src="/images/tour-photo-1.jpg"
                alt="Helgoland Klippen und Besucher"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== PHOTO GALLERY ===== */}
      <div className="overflow-hidden py-4">
        {/* Row 1 */}
        <div className="flex gap-2 mb-2">
          <div
            className="flex gap-2"
            style={{
              animation: "marquee-left 40s linear infinite",
              width: "fit-content",
            }}
          >
            {[...galleryRow1, ...galleryRow1, ...galleryRow1, ...galleryRow1].map((photo, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[440px] md:w-[560px] h-[260px] md:h-[320px] rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={460}
                  height={260}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        {/* Row 2 */}
        <div className="flex gap-2">
          <div
            className="flex gap-2"
            style={{
              animation: "marquee-right 40s linear infinite",
              width: "fit-content",
            }}
          >
            {[...galleryRow2, ...galleryRow2, ...galleryRow2, ...galleryRow2].map((photo, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[360px] md:w-[440px] h-[240px] md:h-[280px] rounded-lg overflow-hidden"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={340}
                  height={230}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== JETZT BUCHEN - TOUR CARDS ===== */}
      <div className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <SectionPill label="Jetzt buchen!" />
            <p className="text-dark/60 text-base md:text-lg max-w-2xl mx-auto">
              Wählen Sie zwischen unserer klassischen Unterland-Tour und der
              Premium-Tour in kleiner Gruppe mit Ausstieg an der Langen Anna.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {[...tours].sort((a, b) => b.price_adult - a.price_adult).map((tour) => (
              <TourCard key={tour.id} tour={tour} onBook={handleBook} />
            ))}
          </div>

          {/* Group booking */}
          <div className="mt-16 text-center">
            <p className="text-dark/60 text-sm md:text-base">
              Gruppenrabatte f&uuml;r Reiseanbieter? Kontaktieren Sie uns f&uuml;r einen Rabattcode:{" "}
              <a
                href="mailto:info@helgolandbahn.de"
                className="text-primary hover:underline font-semibold"
              >
                info@helgolandbahn.de
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
