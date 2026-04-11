"use client";

import { useState } from "react";
import Image from "next/image";

const faqs = [
  {
    question: "Darf ich mir aussuchen, wo ich sitzen möchte?",
    answer:
      "Ja, grundsätzlich freie Platzwahl. Unsere Mitarbeiter bemühen sich, die Sitzplätze so zu organisieren, dass jeder mit seinen Bekannten zusammensitzen kann. Am besten 15 Minuten vor Abfahrt da sein!",
  },
  {
    question: "Darf ich Snacks und Getränke mitbringen?",
    answer:
      "Gerne dürfen Sie sich Snacks und Getränke mitbringen. Allerdings bitten wir darum, Speisen zu vermeiden, die leicht kleckern oder verschütten können - kein Eis, kein Ketchup. Ein Bier ist auch okay. Und Vorsicht vor den Möwen!",
  },
  {
    question: "Kann ich mein Gepäck mitnehmen?",
    answer:
      "Leider können wir weder Gepäcktransport noch Gepäckmitnahme anbieten. Unser Ticketverkäufer Tomek kann zwischen 11:30 und 14:30 Uhr ein Auge auf Ihre Sachen werfen - allerdings ohne Haftung. Aber auf Helgoland klaut keiner!",
  },
  {
    question: "Wie sieht es mit Rollatoren oder Rollstühlen aus?",
    answer:
      "Unterland-Tour: 1 Rollstuhlplatz verfügbar (kein E-Rollstuhl, zu schwer). Rollatoren können bei Tomek am Platz geparkt werden. Premium-Tour: Ein zusammenklappbarer Rollator kann bei nicht voller Belegung mitgenommen werden - ist aber nicht garantiert. Der Weg an der Langen Anna ist erneuert und es gibt viele Bänke.",
  },
  {
    question: "Kann ich meinen Hund mitnehmen?",
    answer:
      "Unterland-Tour: Ja, Hunde bis mittlerer Größe, angeleint bitte. Kleine Hunde dürfen auf den Schoß. Premium-Tour: Leider keine Hunde erlaubt.",
  },
  {
    question: "Gibt es Toiletten in der Nähe?",
    answer:
      "Ja, direkt an der Landungsbrücke gibt es eine kostenlose öffentliche Toilette. Wichtig: Während der Touren gibt es keine Toilettenmöglichkeit - auch nicht an der Langen Anna! Bitte vorher gehen.",
  },
  {
    question: "Was passiert bei schlechtem Wetter?",
    answer:
      "Bei Regen fahren wir ganz normal - unsere Wagen sind überdacht und haben bei Bedarf Seitenabdeckungen. Bei extremem Wetter (Sturm, Gewitter) können Touren ausfallen. Online-Buchungen erhalten in dem Fall automatisch eine volle Rückerstattung.",
  },
];

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
      {label}
    </span>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <section id="faq" className="px-5 md:px-10 lg:px-20 py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-10">
          <div>
            <SectionPill label="FAQ" />
            <h2 className="text-[28px] md:text-[40px] font-bold text-dark leading-tight">
              Häufig gestellte Fragen (FAQ)
            </h2>
          </div>
          <a
            href="#kontakt"
            className="mt-4 md:mt-2 inline-flex items-center gap-2 border border-dark/20 text-dark rounded-full px-5 py-2 text-sm font-medium hover:bg-dark/5 transition-colors self-start"
          >
            Weitere Fragen? Hier kontaktieren.
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Large photo */}
          <div className="relative w-full aspect-[3/4] md:aspect-auto md:h-full rounded-2xl overflow-hidden min-h-[400px]">
            <Image
              src="/images/premium-20250807_120428.jpg"
              alt="Premium-Tour Sitzplätze"
              fill
              className="object-cover"
            />
          </div>

          {/* Right: Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                >
                  {/* Red circle bullet */}
                  <span className="flex-shrink-0 w-3 h-3 rounded-full bg-primary" />
                  <span className="font-medium text-dark pr-4 flex-1 text-sm md:text-base">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className={`text-dark/40 transition-transform duration-300 ${
                        openIndex === i ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="4 6 8 10 12 6" />
                    </svg>
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{
                    maxHeight: openIndex === i ? "500px" : "0px",
                    opacity: openIndex === i ? 1 : 0,
                  }}
                >
                  <p className="px-4 md:px-5 pb-4 md:pb-5 pl-10 md:pl-12 text-dark/60 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
