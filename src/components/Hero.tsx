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
    <section className="px-5 md:px-10 lg:px-20 pt-6 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero image container with rounded corners */}
        <div className="relative w-full aspect-[16/7] md:aspect-[16/6] rounded-2xl overflow-hidden">
          <Image
            src="/images/topdown.jpg"
            alt="Helgoland Luftaufnahme"
            fill
            priority
            className="object-cover"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content - LEFT aligned */}
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-14 lg:px-20 text-white">
            <h1 className="text-[28px] md:text-[44px] lg:text-[52px] font-bold leading-[1.15] mb-4 max-w-2xl">
              Geführte Inselrundfahrten
              <br />
              auf Helgoland
            </h1>

            {/* Rotating text */}
            <div className="h-14 md:h-10 flex items-start">
              <p
                className={`text-base md:text-lg text-white/85 font-medium max-w-xl transition-all duration-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                ...{rotatingTexts[currentIndex]}
              </p>
            </div>
          </div>

        </div>

        {/* Scroll down indicator - centered red circle below image */}
        <div className="flex justify-center mt-6">
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
      </div>
    </section>
  );
}
