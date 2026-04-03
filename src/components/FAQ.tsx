"use client";

import { useState } from "react";
import Image from "next/image";

const faqs = [
  {
    question: "Was ist die Inselbahn für ein Fahrzeug?",
    answer:
      "Eine Bimmelbahn und zwei Sonderanfertigungen aus dem Jahr 2025, gebaut vom weltweit bekannten Achterbahnhersteller INTAMIN — perfekt für die Bedingungen auf Helgoland abgestimmt, mega stark und robust. Auf Helgoland dürfen alle Fahrzeuge max. 10 km/h fahren, innerorts 6 km/h.",
  },
  {
    question: "Können Babys und Kleinkinder mitfahren?",
    answer:
      "Ja, jedes Alter ist willkommen! Babytragen sind kein Problem. Kinder unter 6 Jahren bekommen einen eigenen Sitzplatz und fahren kostenlos.",
  },
  {
    question: "Gibt es einen Familienpreis oder Rabatt?",
    answer:
      "Nein, es gibt keine speziellen Familienrabatte. Kinder unter 6 fahren kostenlos, Kinder von 6 bis 14 Jahren zahlen den reduzierten Kinderpreis. Bei der Unterland-Tour um 14:30 Uhr fahren alle Kinder kostenlos.",
  },
  {
    question: "Gibt es einen Stammkunden-Rabatt?",
    answer:
      "Nach jeder Tour erhalten Sie per E-Mail einen persönlichen 10%-Rabattcode für Ihre nächste Buchung. Teilen Sie ihn gerne mit Freunden und Familie!",
  },
  {
    question: "Kann ich die Bahn privat buchen?",
    answer:
      "Ja, auf Anfrage möglich. Alternativ können Sie auch alle Plätze eines Fahrzeugs buchen.",
  },
  {
    question: "Gibt es eine Mindestteilnehmerzahl?",
    answer:
      "Nein. Wenn wir eine Person glücklich machen können, sind wir glücklich.",
  },
  {
    question: "Geburtstage oder Junggesellenabschiede?",
    answer:
      "Ja, auf Anfrage möglich! Kontaktieren Sie uns per E-Mail für individuelle Absprachen.",
  },
  {
    question: "Darf ich mir aussuchen, wo ich sitzen möchte?",
    answer:
      "Ja, freie Platzwahl. Es gilt: first come, first serve — also am besten 15 Minuten vor Abfahrt da sein!",
  },
  {
    question: "Sind die Fahrzeuge überdacht?",
    answer:
      "Ja, unsere Fahrzeuge sind von oben überdacht. Bei Kälte und Regen gibt es zusätzliche Seitenabdeckungen — Sie bleiben also trocken!",
  },
  {
    question: "Darf man während der Fahrt stehen?",
    answer:
      "Nein, auf keinen Fall. Bitte bleiben Sie während der gesamten Fahrt immer sitzen.",
  },
  {
    question: "Darf man während der Fahrt telefonieren?",
    answer:
      "Nein, bitte nicht. Aus Rücksicht auf die anderen Fahrgäste und die Audioansage bitten wir darum, auf Telefonate zu verzichten.",
  },
  {
    question: "Darf ich Snacks und Getränke mitbringen?",
    answer:
      "Ja, aber bitte nichts was kleckert oder tropft — kein Eis, kein Ketchup. Ein Bier ist auch okay. Und Vorsicht vor den Möwen!",
  },
  {
    question: "Kann ich mein Gepäck mitnehmen?",
    answer:
      "Nein, Gepäck kann leider nicht mitgenommen werden. Unser Ticketverkäufer Tomek kann zwischen 11:30 und 14:30 Uhr ein Auge auf Ihre Sachen werfen — allerdings ohne Haftung.",
  },
  {
    question: "Gibt es eine Gepäckaufbewahrung?",
    answer:
      "Unser Ticketverkäufer Tomek ist von 11:30 bis 14:30 Uhr vor Ort und kann Gepäck beaufsichtigen. Keine Haftung — aber auf Helgoland klaut keiner!",
  },
  {
    question: "Wie sieht es mit Rollatoren oder Rollstühlen aus?",
    answer:
      "Unterland-Tour: 1 Rollstuhlplatz (kein E-Rollstuhl, zu schwer). Rollatoren können bei Tomek geparkt werden. Premium-Tour: Ein zusammenklappbarer Rollator kann bei nicht voller Belegung mitgenommen und am Zugfahrzeug befestigt werden, ist aber nicht garantiert.",
  },
  {
    question: "Kann ich meinen Hund mitnehmen?",
    answer:
      "Unterland-Tour: Ja, Hunde bis mittlerer Größe, angeleint bitte. Premium-Tour: Leider keine Hunde, wegen der steilen Wege und engen Pfade im Oberland.",
  },
  {
    question: "Gibt es Toiletten in der Nähe?",
    answer:
      "Ja, direkt an der Landungsbrücke gibt es eine kostenlose öffentliche Toilette. Wichtig: Während der Touren gibt es keine Toilettenmöglichkeit — auch nicht an der Langen Anna!",
  },
  {
    question: "Was passiert bei schlechtem Wetter?",
    answer:
      "Bei Regen fahren wir ganz normal — unsere Wagen sind überdacht und haben bei Bedarf Seitenabdeckungen. Bei Sturm oder Gewitter können Touren ausfallen — Sie erhalten dann automatisch eine volle Rückerstattung.",
  },
  {
    question: "Was passiert bei Sturmwarnung?",
    answer:
      "Wenn alle Schiffe den Betrieb einstellen, müssen auch wir wahrscheinlich pausieren. Bei Gewitter und extremem Regen ebenfalls. Bei Ausfall erhalten Sie eine volle Rückerstattung.",
  },
  {
    question: "Wann ist die beste Jahreszeit für eine Tour?",
    answer:
      "Die beste Helgoland-Saison ist Juni bis August, aber unsere Tour ist immer gut. Bei Regen bleibt man trocken, bei Sonne ist es wunderbar, und der Fahrtwind ist auch klasse.",
  },
  {
    question: "Wie lange im Voraus sollte ich buchen?",
    answer:
      "Idealerweise sobald Sie sich entschieden haben. Unsere Touren, insbesondere die Premium-Tour, sind sehr beliebt und können schnell ausgebucht sein.",
  },
  {
    question: "Fährt die Bahn auch an Feiertagen oder im Winter?",
    answer:
      "Nein, wir fahren nicht im Winter. Unsere Saison ist in der Regel von Anfang April bis Ende Oktober.",
  },
  {
    question: "Kann ich meine Buchung stornieren?",
    answer:
      "Ja, kostenlose Stornierung bis Mitternacht am Vortag — für alle gleich. Nutzen Sie den Stornierungslink in Ihrer Bestätigungs-E-Mail oder unseren Self-Service-Bereich.",
  },
  {
    question: "Wann ist die beste Zeit zur Vogelbeobachtung?",
    answer:
      "Die beste Zeit ist Mai bis August. Im Juni findet der berühmte Lummensprung statt. Bis zu 15.000 Vögel werden jährlich auf Helgoland beringt.",
  },
  {
    question: "Wie komme ich zur Düne und was kostet die Fähre?",
    answer:
      "Die Dünenfähre \u201EWitte Kliff\u201C fährt alle 30 Minuten vom Helgoländer Hafen. Erwachsene zahlen 6\u00A0\u20AC, Kinder den halben Preis.",
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
