"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const rotatingTexts = [
  "einer praktischen Tour, die Ihnen alle Highlights in kurzer Zeit zeigt.",
  "leichter Erkundung ohne anstrengende Wege.",
  "unschlagbaren Fotomöglichkeiten an besten Aussichtspunkten.",
  "lebhaften Geschichten und Informationen zu Helgoland.",
  "zeitsparenden Touren, die Ihnen das Beste von Helgoland zeigen.",
  "einer bequemen Fahrt mit professioneller Führung.",
  "Zugang zur berühmten Langen Anna.",
  "einer unvergesslichen Inselerfahrung für die ganze Familie.",
  "Entdeckung der einzigartigen Flora und Fauna.",
  "einem Erlebnis, das Sie nicht verpassen sollten.",
  "atemberaubenden Ausblicken auf die Nordsee.",
  "einer Tour, die perfekt für Tagesgäste geeignet ist.",
  "der Möglichkeit, Helgolands Geschichte hautnah zu erleben.",
  "einer barrierefreien Tour für alle Altersgruppen.",
  "besonderen Einblicken in Helgolands Natur.",
  "einem stressfreien Start in Ihren Helgoland-Besuch.",
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingTexts.length);
        setIsVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative">
      {/* Full-width hero image */}
      <div className="relative w-full min-h-[50vh] md:min-h-[55vh] lg:min-h-[60vh] overflow-hidden">
        <Image
          src="/images/topdown.jpg"
          alt="Helgoland Luftaufnahme"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/55" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-12 sm:pb-14 md:pb-16 px-5 sm:px-8 md:px-14 lg:px-20 max-w-7xl mx-auto text-white">
          <h1 className="text-[24px] sm:text-[32px] md:text-[42px] lg:text-[52px] font-bold leading-[1.1] mb-2 md:mb-3">
            Starten Sie Ihr
            <br className="sm:hidden" />
            {" "}Helgoland-Abenteuer
            <br className="hidden sm:block" />
            {" "}mit...
          </h1>

          {/* Rotating text */}
          <div className="h-[40px] sm:h-[36px] md:h-[52px] lg:h-[60px] flex items-start overflow-hidden">
            <p
              className={`text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] text-white/80 italic font-light max-w-2xl transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              ...{rotatingTexts[currentIndex]}
            </p>
          </div>

          {/* CTA + Rating inline */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap mt-2">
            <a
              href="#buchung"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm md:text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              Sofort buchen
            </a>
            <a
              href="https://g.page/r/CeEvXFmlaLMwEBE/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] md:text-[13px] text-white/60 hover:text-white/80 transition-colors"
            >
              <span className="text-amber-400">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
              <span>4,9 / 5 bei 230+ Bewertungen</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div className="flex justify-center -mt-6 relative z-10">
          <a
            href="#touren"
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors animate-float"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7 8 12 13 17 8" />
              <polyline points="7 14 12 19 17 14" />
            </svg>
          </a>
        </div>
    </section>
  );
}
