"use client";

import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import WeatherWidget from "./WeatherWidget";

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

export default function Schedule() {
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

        {/* Unterland-Tour Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-dark uppercase tracking-wide mb-5">
              Unterland-Tour
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">13:30 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">14:30 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
            </div>
            <div className="border-t border-dark/10 pt-4">
              <p className="text-dark/60 text-sm">
                Erwachsene: <span className="font-semibold text-dark">11&euro;</span> &middot;
                Kinder (unter 15): <span className="font-semibold text-dark">6&euro;</span>
              </p>
            </div>
          </div>
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
            <Image
              src="/images/helgolandbahn-photo-1.jpg"
              alt="Unterland-Tour Inselbahn"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Premium-Tour Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-surface rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-dark uppercase tracking-wide mb-5">
              Premium-Tour
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">11:00 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">(12:15 Uhr)</span>
                <span className="text-dark/50 text-sm">Schiffsankunft</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">13:15 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">14:00 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">15:00 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark font-semibold text-lg">16:00 Uhr</span>
                <span className="text-dark/50 text-sm">Abfahrt</span>
              </div>
            </div>
            <div className="border-t border-dark/10 pt-4">
              <p className="text-dark/60 text-sm">
                Erwachsene: <span className="font-semibold text-dark">22&euro;</span> &middot;
                Kinder (unter 15): <span className="font-semibold text-dark">15&euro;</span>
              </p>
            </div>
          </div>
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
            <Image
              src="/images/helgolandbahn-photo-2.jpg"
              alt="Premium-Tour Inselbahn"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <p className="text-sm text-dark/50 text-center">
          *Bei den letzten Fahrten ist ein Ausstieg am Hafen / Schiff moeglich.
        </p>
      </div>
    </section>
  );
}
