"use client";

import { useState } from "react";
import Image from "next/image";

const faqs = [
  {
    question: "Was ist die Inselbahn für ein Fahrzeug?",
    answer:
      "Unsere Inselbahn besteht aus drei Sonderanfertigungen aus dem Jahr 2025, gebaut vom weltweit bekannten Achterbahnhersteller Intamin — perfekt für die Bedingungen auf Helgoland abgestimmt, mega stark und robust. Zwei Premium-Tour-Fahrzeuge (je max. 18 Personen) und ein großes Unterland-Tour-Fahrzeug (max. 42 Personen + 1 Rollstuhlplatz). Auf Helgoland dürfen alle Fahrzeuge max. 10 km/h fahren, innerorts 6 km/h.",
  },
  {
    question: "Darf ich mir aussuchen, wo ich sitzen möchte?",
    answer:
      "Ja, Sie dürfen sich Ihren Platz aussuchen. Es gilt: first come, first serve — also am besten 15 Minuten vor Abfahrt da sein!",
  },
  {
    question: "Darf ich Snacks und Getränke mitbringen?",
    answer:
      "Grundsätzlich ja, allerdings bitten wir darum, Speisen zu vermeiden, die leicht kleckern. Wasser, Gummibärchen und ähnliches sind kein Problem. Eis, Fischbrötchen oder Ketchup bitte nicht. Ein Bier ist auch okay — stark alkoholisierte Personen dürfen aus Sicherheitsgründen nicht mitfahren.",
  },
  {
    question: "Kann ich mein Gepäck mitnehmen?",
    answer:
      "Leider nein. Wir bitten Sie, nur das mitzubringen, was Sie während der Fahrt benötigen. Unser Ticketverkäufer Tomek kann zwischen 11:30 und 14:30 Uhr ein Auge auf Ihre Sachen werfen — allerdings ohne Haftung. Auf Helgoland klaut aber keiner!",
  },
  {
    question: "Wie sieht es mit Rollatoren oder Rollstühlen aus?",
    answer:
      "Die Unterland-Tour bietet einen Rollstuhlplatz (kein E-Rollstuhl — zu schwer). Rollatoren können bei Tomek geparkt werden — auf Helgoland klaut keiner, schon gar nicht Rollatoren! Bei der Premium-Tour kann ein zusammenklappbarer Rollator bei nicht voller Belegung mitgenommen werden, ist aber nicht garantiert. Beide Touren empfehlen wir für Gehbehinderte — an der Langen Anna gibt es Bänke und der Weg wurde erneuert.",
  },
  {
    question: "Kann ich meinen Hund mitnehmen?",
    answer:
      "Bei der Unterland-Tour ja — Hunde bis mittlerer Größe, angeleint bitte. Bei der Premium-Tour leider nein, wegen der steilen Wege und engen Pfade im Oberland.",
  },
  {
    question: "Darf man während der Fahrt stehen oder telefonieren?",
    answer:
      "Nein, beides ist aus Sicherheitsgründen nicht erlaubt. Bitte bleiben Sie während der gesamten Fahrt auf Ihrem Platz sitzen.",
  },
  {
    question: "Können Babys und Kleinkinder mitfahren?",
    answer:
      "Ja, Babys und Kleinkinder sind willkommen! Kinder unter 6 Jahren fahren kostenlos und bekommen einen eigenen Sitzplatz. Baby-Tragen sind kein Problem.",
  },
  {
    question: "Sind die Fahrzeuge überdacht?",
    answer:
      "Ja, unsere Fahrzeuge sind von oben überdacht. Bei Kälte oder Regen haben wir zusätzlich Seitenabdeckungen — Sie bleiben also trocken!",
  },
  {
    question: "Gibt es Toiletten in der Nähe?",
    answer:
      "Ja, direkt am Abfahrtsort an der Landungsbrücke gibt es kostenlose öffentliche Toiletten. Wichtig: Während der Premium-Tour gibt es keine Toilettenmöglichkeit — auch nicht an der Langen Anna!",
  },
  {
    question: "Wie komme ich zur Düne und was kostet die Fähre?",
    answer:
      "Die D\u00FCnenf\u00E4hre \u201EWitte Kliff\u201C f\u00E4hrt alle 30 Minuten vom Helgol\u00E4nder Hafen. Erwachsene zahlen 6\u00A0\u20AC, Kinder den halben Preis. Auf der D\u00FCne erwarten Sie Sandstrand, neugierige Kegelrobben und Seehunde und den weltweit einzigartigen Roten Flint.",
  },
  {
    question: "Wann ist die beste Jahreszeit für eine Tour?",
    answer:
      "Die beste Helgoland-Saison ist Juni bis August, aber unsere Tour ist immer gut. Bei Regen bleibt man trocken, bei Sonne ist es wunderbar, und der Fahrtwind ist klasse. Unsere Saison läuft von Anfang April bis Ende Oktober.",
  },
  {
    question: "Wie lange im Voraus sollte ich buchen?",
    answer:
      "Idealerweise sobald Sie sich entschieden haben. Unsere Touren, insbesondere die Premium-Tour, sind sehr beliebt und können schnell ausgebucht sein.",
  },
  {
    question: "Was passiert bei schlechtem Wetter?",
    answer:
      "Bei Regen fahren wir ganz normal — unsere Fahrzeuge sind überdacht. Bei Sturm, Gewitter oder extremem Wetter können Fahrten ausfallen. In dem Fall erhalten Sie automatisch eine volle Rückerstattung.",
  },
  {
    question: "Kann ich meine Buchung stornieren?",
    answer:
      "Ja, kostenlose Stornierung bis Mitternacht am Vortag — für alle gleich. Nutzen Sie den Stornierungslink in Ihrer Bestätigungs-E-Mail oder unseren Self-Service-Bereich.",
  },
  {
    question: "Fährt die Bahn auch an Feiertagen?",
    answer:
      "Wir fahren während der gesamten Saison (April bis Oktober). Im Winter findet kein Betrieb statt.",
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
              src="/images/helgolandbahn-photo-1.jpg"
              alt="Inselbahn vor bunten Häusern"
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
