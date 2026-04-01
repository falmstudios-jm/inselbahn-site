"use client";

import { useState } from "react";
import Image from "next/image";

const faqs = [
  {
    question: "Was ist die Inselbahn für ein Fahrzeug?",
    answer:
      "Unsere Inselbahn ist ein elektrischer Oldtimer aus den späten 1970er-Jahren mit 11 PS Antrieb. Das Fahrzeug wiegt mit Passagieren rund 5 Tonnen und fährt maximal 6 km/h in der Stadt und 10 km/h außerhalb. Fußgänger haben auf Helgoland immer Vorrang — hupen ist verboten!",
  },
  {
    question: "Darf ich mir aussuchen, wo ich sitzen möchte?",
    answer:
      "Ja, grundsätzlich dürfen Sie. Unsere Mitarbeiter bemühen sich, die Sitzplätze so zu organisieren, dass jeder mit seinen Bekannten zusammensitzen kann. Wenn die Tour nicht voll ausgelastet ist, dürfen Sie Ihren Platz natürlich selbst aussuchen. Generell gilt bei uns: first come, first serve.",
  },
  {
    question: "Darf ich Snacks und Getränke mitbringen?",
    answer:
      "Gerne dürfen Sie sich Snacks und Getränke mitbringen. Allerdings bitten wir darum, Speisen zu vermeiden, die leicht kleckern oder verschütten können. Wasser, Gummibärchen und ähnliches sind in Ordnung. Eis, Nutella, Fischbrötchen oder Ketchup sind leider verboten.",
  },
  {
    question: "Kann ich mein Gepäck mitnehmen?",
    answer:
      "Leider können wir weder Gepäcktransport, noch Gepäckmitnahme anbieten. Wir bitten Sie, nur das mitzubringen, was Sie während der Fahrt benötigen.",
  },
  {
    question: "Wie sieht es mit Rollatoren oder Rollstühlen aus?",
    answer:
      "Mobilität ist uns sehr wichtig und wir geben unser Bestes, um jeden Gast auf unserer malerischen Inselreise willkommen zu heißen. Die Unterland-Tour bietet einen Rollstuhlplatz und Rollatoren können beim Ticketverkäufer deponiert oder mitgenommen werden. Zum Oberland gibt es einen Fahrstuhl (alternativ 182-260 Stufen). Die Premium-Tour empfehlen wir hingegen eher für die \u2018Bergziegen\u2019 unter unseren Gästen, da die Wege im Oberland nicht vollständig barrierefrei sind.",
  },
  {
    question: "Kann ich meinen Hund mitnehmen?",
    answer:
      "Kleinere Hunde, die auf dem Schoß mitfahren könnten, sind in der Regel erlaubt. Größere Hunde können im hinteren Teil der Inselbahn Platz finden, aber dies hängt von der aktuellen Kapazität ab. Bei der Premium-Tour müssen wir aus Platzgründen und zum Wohl aller Passagiere leider grundsätzlich auf alle Hunde verzichten.",
  },
  {
    question: "Wie komme ich zur Düne und was kostet die Fähre?",
    answer:
      "Die Dünenfähre \u201eWitte Kliff\u201c fährt alle 30 Minuten vom Helgoländer Hafen zur Nachbarinsel Düne. Erwachsene zahlen 6 \u20AC, Kinder den halben Preis. Auf der Düne erwarten Sie ca. 130.000 m\u00B2 Sandstrand, neugierige Kegelrobben und Seehunde und den weltweit einzigartigen Roten Flint — einen roten Feuerstein, den es nur hier gibt.",
  },
  {
    question: "Wann ist die beste Zeit für Vogelbeobachtung?",
    answer:
      "Die Brutkolonie am Lummenfelsen ist von Mai bis August am aktivsten, mit Trottellummen, Basstölpeln, Dreizehenmöwen und Tordalken. Das absolute Highlight ist der Lummensprung im Juni, wenn die flugunfähigen Küken von den Klippen ins Meer springen. Die Vogelwarte auf dem Oberland beringt jährlich bis zu 15.000 Vögel. Auf der Düne können Sie ganzjährig Robben beobachten, besonders im Winter gibt es Robbenbabys.",
  },
  {
    question: "Gibt es Toiletten in der Nähe?",
    answer:
      "Ja, es gibt kostenpflichtige Toiletten an der Landungsbrücke. Am Hafen gibt es auch welche, aber zwischen Schiffsausstieg und Bahnabfahrt haben Sie wahrscheinlich keine Zeit, diese zu erreichen. Daher empfehlen wir Ihnen, vor der Abfahrt das stille Örtchen auf dem Schiff aufzusuchen.",
  },
  {
    question: "Was passiert bei schlechtem Wetter?",
    answer:
      "Wir Helgoländer sind hart im Nehmen, aber wenn selbst die Schafe sich an Masten festklammern, um nicht wegzufliegen, dann ist es Zeit, die Fahrten abzusagen. Wir tun unser Bestes, um Sie rechtzeitig zu informieren. Bei Online-Buchungen gibt es eine Rückerstattung.",
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
