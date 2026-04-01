"use client";

import Image from "next/image";

const reviews = [
  {
    text: "Es ist sein Geld wert. Man erfaehrt viel ueber die Insel und seine Geschichte. Kann es nur empfehlen!",
    author: "Michael M.",
    stars: 5,
  },
  {
    text: "Tolle Tour mit super netten Fahrern. Besonders die Premium-Tour mit Ausstieg an der Langen Anna war ein Highlight!",
    author: "Sandra K.",
    stars: 5,
  },
  {
    text: "Perfekt fuer den ersten Ueberblick nach der Ankunft mit dem Schiff. In 45 Minuten alles Wichtige gesehen!",
    author: "Thomas R.",
    stars: 5,
  },
  {
    text: "Super Erlebnis fuer die ganze Familie! Die Kinder waren begeistert und die Fuehrung war informativ und unterhaltsam.",
    author: "Julia H.",
    stars: 5,
  },
  {
    text: "Die Premium-Tour ist absolut empfehlenswert. Der Ausstieg an der Langen Anna ist unvergesslich. Sehr freundliches Personal.",
    author: "Andreas B.",
    stars: 5,
  },
];

function RedStars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="#F24444"
          stroke="#F24444"
          strokeWidth="0.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

export default function Reviews() {
  return (
    <section className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <SectionPill label="Worte unserer Kunden" />
          <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-8 leading-tight">
            Helgolands am besten bewertete Attraktion!
          </h2>

          {/* Google Reviews header card */}
          <div className="inline-flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 mb-10">
            <Image
              src="/images/google-maps-logo.svg"
              alt="Google"
              width={80}
              height={24}
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-dark">Google Bewertungen</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-dark">4.9</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#FBBC04">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-dark/40 text-sm">(233)</span>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/place/Inselbahn+Helgoland"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Bewerten Sie uns auf Google
            </a>
          </div>
        </div>

        {/* Review cards row */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[260px] md:w-auto bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <RedStars count={review.stars} />
              <p className="text-dark/70 mt-3 mb-4 text-sm leading-relaxed line-clamp-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="font-medium text-dark text-sm">{review.author}</p>
            </div>
          ))}
        </div>

        {/* TripAdvisor badge */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <Image
            src="/images/tripadvisor-logo.svg"
            alt="TripAdvisor"
            width={120}
            height={30}
          />
          <a
            href="https://www.tripadvisor.de/Attraction_Review-g187410-d27144771-Reviews-Inselbahn_Helgoland-Helgoland_Schleswig_Holstein.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-dark/50 hover:text-dark transition-colors"
          >
            Alle Bewertungen lesen &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
