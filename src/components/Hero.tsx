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
      <div className="relative w-full min-h-[60vh] md:min-h-[70vh] overflow-hidden">
        <Image
          src="/images/topdown.jpg"
          alt="Helgoland Luftaufnahme"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlay - darker at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

        {/* Content - LEFT aligned */}
        <div className="absolute inset-0 flex flex-col justify-end pb-[20%] sm:pb-[18%] md:pb-[15%] px-5 sm:px-8 md:px-14 lg:px-20 max-w-7xl mx-auto text-white">
          <h1 className="text-[24px] sm:text-[32px] md:text-[42px] lg:text-[52px] font-bold leading-[1.1] mb-3 md:mb-5">
            Starten Sie Ihr
            <br className="sm:hidden" />
            {" "}Helgoland-Abenteuer
            <br className="hidden sm:block" />
            {" "}mit...
          </h1>

          {/* Rotating text - fixed height so H1 doesn't jump */}
          <div className="h-[48px] sm:h-[40px] md:h-[36px] flex items-start overflow-hidden">
            <p
              className={`text-[14px] sm:text-[16px] md:text-[22px] lg:text-[26px] text-white/90 italic font-light max-w-2xl transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              ...{rotatingTexts[currentIndex]}
            </p>
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
