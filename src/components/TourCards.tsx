"use client";

import Image from "next/image";

const galleryRow1 = [
  { src: "/images/tour-photo-1.jpg", alt: "Helgoland Klippen" },
  { src: "/images/helgolandbahn-photo-1.jpg", alt: "Inselbahn am Hafen" },
  { src: "/images/abfahrt-inselbahn.jpg", alt: "Abfahrt der Inselbahn" },
];

const galleryRow2 = [
  { src: "/images/helgolandbahn-photo-2.jpg", alt: "Fahrgaeste in der Inselbahn" },
  { src: "/images/tour-photo-2.jpg", alt: "Premium-Tour Aussicht" },
  { src: "/images/tour-photo-1.jpg", alt: "Helgoland Natur" },
  { src: "/images/helgolandbahn-photo-1.jpg", alt: "Inselbahn vor Haeusern" },
];

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

export default function TourCards() {
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
                Zu wenig Zeit fur zu viele Eindrucke?
              </h2>
              <p className="text-dark/60 text-base md:text-lg leading-relaxed">
                Helgoland hat so viel zu bieten, aber als Tagesgast bleibt oft wenig
                Zeit. Mit unseren gefuhrten Inselbahn-Touren sehen Sie alle
                Highlights bequem und entspannt &mdash; ohne anstrengende Wege,
                ohne etwas zu verpassen. Lehnen Sie sich zurueck und geniessen Sie
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
              Waehlen Sie zwischen unserer klassischen Unterland-Tour und der
              exklusiven Premium-Tour mit Ausstieg an der Langen Anna.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {/* Unterland-Tour */}
            <div>
              <div className="flex items-center justify-center h-[180px] bg-surface/50 rounded-xl mb-4">
                <Image
                  src="/images/inselbahn-illustration-unterland.svg"
                  alt="Illustration der Unterland-Tour"
                  width={300}
                  height={160}
                  className="w-auto h-auto max-h-[150px]"
                />
              </div>
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/images/helgolandbahn-photo-1.jpg"
                  alt="Inselbahn Unterland-Tour"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-3 text-xs text-dark/50 uppercase tracking-wide font-medium">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  40 Minuten
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  40 Personen + 1 Rollstuhl
                </span>
              </div>

              <h3 className="text-2xl md:text-[28px] font-bold text-dark mb-1">
                Unterland-Tour
              </h3>
              <p className="text-dark font-semibold text-sm mb-3">
                inkl. kurzem Fotostopp im Nordostland
              </p>
              <p className="text-dark/60 text-sm leading-relaxed mb-4">
                Die klassische Inselrundfahrt durch das Unterland. Sie fahren entlang
                der Landungsbruecke, durch das malerische Unterland und erhalten einen
                Fotostopp im Nordostland mit Blick auf die Dune.
              </p>

              <ul className="space-y-2 mb-5">
                <CheckItem text="Hafen & Landungsbrucke" />
                <CheckItem text="Nordostland erkunden" />
                <CheckItem text="Historische Gebaude" />
                <CheckItem text="Fotostopp an den Hummerbuden" />
              </ul>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-dark">ab 11&euro;</span>
                <span className="text-dark/50 text-sm">Erwachsene</span>
              </div>
              <p className="text-dark/50 text-sm">6&euro; Kinder (unter 15)</p>
            </div>

            {/* Premium-Tour */}
            <div>
              <div className="flex items-center justify-center h-[180px] bg-surface/50 rounded-xl mb-4">
                <Image
                  src="/images/inselbahn-illustration-premium.svg"
                  alt="Illustration der Premium-Tour"
                  width={300}
                  height={160}
                  className="w-auto h-auto max-h-[150px]"
                />
              </div>
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5">
                <Image
                  src="/images/helgolandbahn-photo-2.jpg"
                  alt="Inselbahn Premium-Tour"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-3 text-xs text-dark/50 uppercase tracking-wide font-medium">
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  90 Minuten
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  18 Personen
                </span>
              </div>

              <h3 className="text-2xl md:text-[28px] font-bold text-dark mb-1">
                Premium-Tour
              </h3>
              <p className="text-dark font-semibold text-sm mb-3">
                inkl. Ausstieg an der Langen Anna
              </p>
              <p className="text-dark/60 text-sm leading-relaxed mb-4">
                Das komplette Helgoland-Erlebnis. Ober- und Unterland, mit 30 Minuten
                freier Erkundung an der beruhmten Langen Anna. Exklusive Kleingruppe
                fuer ein besonderes Erlebnis.
              </p>

              <ul className="space-y-2 mb-5">
                <CheckItem text="Ober- und Unterland komplett" />
                <CheckItem text="30 Min freie Erkundung" />
                <CheckItem text="Exklusive Kleingruppe" />
                <CheckItem text="Ausstieg an der Langen Anna" />
              </ul>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold text-dark">ab 22&euro;</span>
                <span className="text-dark/50 text-sm">Erwachsene</span>
              </div>
              <p className="text-dark/50 text-sm">
                15&euro; Kinder (unter 15)
              </p>
            </div>
          </div>

          {/* Group booking */}
          <div className="mt-16 text-center">
            <p className="text-dark/60 text-sm md:text-base mb-4">
              Gruppenreservierungen ab 10 Personen? Kontaktieren Sie uns direkt:
            </p>
            <a
              href="https://wa.me/491604170905"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 border border-[#25D366] text-[#25D366] rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-[#25D366]/5 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
