"use client";

import Image from "next/image";

const ferries = [
  { name: 'Dünenanleger', distance: "100m", time: "2 Min" },
  { name: 'Börteboot-Anleger', distance: "200m", time: "3 Min" },
  { name: 'HSC "Halunder Jet"', distance: "350m", time: "5 Min" },
  { name: 'MS "Nordlicht"', distance: "500m", time: "8 Min" },
  { name: 'MS "Funny Girl"', distance: "1.100m", time: "15 Min" },
  { name: 'MS "Helgoland"', distance: "1.100m", time: "15 Min" },
];

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

export default function GettingThere() {
  return (
    <section id="anfahrt" className="px-5 md:px-10 lg:px-20 py-20 md:py-28">
      <div className="max-w-7xl mx-auto">
        <SectionPill label="Wo sind wir?" />
        <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-10 leading-tight">
          Abfahrt in zentraler Lage
        </h2>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start mb-12">
          {/* Left: text + walking times */}
          <div>
            <p className="text-dark/60 text-base leading-relaxed mb-6">
              Unsere Inselbahn startet am <strong className="text-dark">Franz-Schensky-Platz</strong>,
              direkt neben der Tourist-Information und der Büste von Heinrich Hoffmann von Fallersleben, am Landungsbrückenvorplatz. Von allen Fähranlegern bequem zu Fuß erreichbar.
            </p>

            {/* Walking times table */}
            <div className="bg-surface rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark/10">
                    <th className="text-left py-3 px-4 font-semibold text-dark">Fähre</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark">Entfernung</th>
                    <th className="text-right py-3 px-4 font-semibold text-dark">Fußweg</th>
                  </tr>
                </thead>
                <tbody>
                  {ferries.map((ferry) => (
                    <tr key={ferry.name} className="border-b border-dark/5 last:border-0">
                      <td className="py-3 px-4 text-dark/70">{ferry.name}</td>
                      <td className="py-3 px-4 text-dark/50 text-right">{ferry.distance}</td>
                      <td className="py-3 px-4 text-dark font-medium text-right">{ferry.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: aerial photo with badge */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/abfahrt-inselbahn.jpg"
              alt="Abfahrt Inselbahn Luftaufnahme"
              fill
              className="object-cover"
            />
            {/* Red badge overlay */}
            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
              Abfahrt hier
            </div>
          </div>
        </div>

        {/* Ferry illustration */}
        <div className="flex justify-center mb-8">
          <Image
            src="/images/schiff-ferry.png"
            alt="Fähre Illustration"
            width={300}
            height={120}
            className="opacity-60"
          />
        </div>

        {/* Google Maps button */}
        <div className="text-center">
          <a
            href="https://www.google.com/maps/place/Inselbahn+Rundfahrten+Helgoland/@54.1810127,7.8906696,17z"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 border border-dark/20 text-dark rounded-full px-6 py-2.5 font-semibold text-sm hover:bg-dark/5 transition-colors"
          >
            <Image
              src="/images/google-maps-logo.svg"
              alt="Google Maps"
              width={20}
              height={20}
            />
            Finde uns auf Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
