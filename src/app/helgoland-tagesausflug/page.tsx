import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Helgoland Tagesausflug — So nutzen Sie Ihre Zeit optimal",
  description:
    "Planen Sie Ihren perfekten Helgoland Tagesausflug: Fährankunft, Inselbahn-Tour, Sehenswürdigkeiten und zollfreies Shopping. Tipps für einen unvergesslichen Tag auf der Hochseeinsel.",
  keywords: [
    "Helgoland Tagesausflug",
    "Helgoland Tagesfahrt",
    "Helgoland Ausflug",
    "Helgoland Fähre",
    "Helgoland Zeitplan",
    "Helgoland Tipps",
    "Helgoland Shopping",
    "Inselbahn Helgoland",
  ],
  alternates: {
    canonical: "https://helgolandbahn.de/helgoland-tagesausflug",
  },
  openGraph: {
    title: "Helgoland Tagesausflug — So nutzen Sie Ihre Zeit optimal",
    description:
      "Der perfekte Helgoland Tagesausflug: Ankunft, Inselbahn-Tour, Sehenswürdigkeiten und Shopping. Alle Tipps für Ihren Tag.",
    url: "https://helgolandbahn.de/helgoland-tagesausflug",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "article",
  },
};

const timelineSteps = [
  {
    time: "09:00 - 11:30",
    title: "Ankunft auf Helgoland",
    description:
      "Je nach Fähre erreichen Sie Helgoland zwischen 9:00 und 11:30 Uhr. Vom Anleger sind es nur wenige Minuten zu Fuß zum Lung Wai, dem Startpunkt der Inselbahn.",
  },
  {
    time: "11:00 - 12:30",
    title: "Inselbahn-Tour",
    description:
      "Starten Sie Ihren Tag mit einer geführten Inselbahn-Tour. Die Unterland-Tour (ca. 45 Min) gibt Ihnen einen perfekten ersten Überblick. Für das volle Erlebnis empfehlen wir die Premium-Tour (ca. 90 Min) mit Ausstieg an der Langen Anna.",
  },
  {
    time: "12:30 - 14:00",
    title: "Mittagessen & Hummerbuden",
    description:
      "Genießen Sie frischen Fisch in einem der Restaurants im Unterland oder stöbern Sie durch die bunten Hummerbuden am Binnenhafen (\u201eScheibenhafen\u201c). Hier finden Sie Galerien, Schmuckläden, Gastronomie und sogar ein Standesamt! Vorsicht: Fischbrötchen nicht offen tragen — die Möwen auf Helgoland sind berüchtigt dafür, einem das Essen zu klauen.",
  },
  {
    time: "14:00 - 15:30",
    title: "Oberland & Klippenrundweg",
    description:
      "Nehmen Sie den Fahrstuhl oder steigen Sie die 182-260 Stufen hinauf ins Oberland (\u201edeät Bopperlun\u201c). Der ca. 3 km lange Klippenrandweg (ca. 1,5 Stunden) bietet spektakuläre Ausblicke auf die Nordsee, die Lange Anna und den Lummenfelsen mit seinen Trottellummen und Basstölpeln. Der höchste Punkt, der Pinneberg, liegt auf 61,3 Metern.",
  },
  {
    time: "15:30 - 16:30",
    title: "Zollfreies Shopping",
    description:
      "Helgoland ist zollfrei! Spirituosen, Parfüm, Tabakwaren und Süßigkeiten sind hier deutlich günstiger als auf dem Festland. Oder nehmen Sie die Dünenfähre \u201eWitte Kliff\u201c (6 € Erwachsene, alle 30 Min.) zur Nachbarinsel Düne — mit Robben am Strand und dem weltweit einzigartigen Roten Flint.",
  },
  {
    time: "16:30 - 17:30",
    title: "Rückfahrt",
    description:
      "Machen Sie sich rechtzeitig auf den Weg zum Anleger für Ihre Rückfähre. Die genauen Abfahrtszeiten variieren je nach Reederei und Saison.",
  },
];

const tips = [
  "Buchen Sie Ihre Inselbahn-Tour im Voraus online, um sich einen Platz zu sichern.",
  "Sagen Sie \u201eHallo\u201c oder \u201eHey\u201c zur Begrüßung — \u201eMoin Moin\u201c sagt man auf Helgoland nicht!",
  "Achtung Möwen! Die Helgoländer Silbermöwen stehlen Fischbrötchen direkt aus der Hand. Essen besser in Innenräumen genießen.",
  "Zum Oberland per Fahrstuhl oder 182-260 Stufen — der Fahrstuhl ist bequemer, die Treppe hat den besseren Ausblick.",
  "Helgoland ist zollfrei! Spirituosen, Parfüm, Tabak und Süßigkeiten gibt es hier deutlich günstiger als auf dem Festland.",
  "Dünenfähre \u201eWitte Kliff\u201c: 6 € Erwachsene, halber Preis für Kinder, fährt alle 30 Minuten. Robben und den einzigartigen Roten Flint gibt es nur dort!",
  "Kein Fahrradfahren und keine Autos auf Helgoland — Fußgänger haben immer Vorrang. Genießen Sie die Ruhe!",
  "Packen Sie eine winddichte Jacke ein, auch bei Sonnenschein kann es auf Helgoland windig sein. Die Insel liegt 60 km vom Festland im offenen Meer.",
];

export default function TagesausflugPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Back link */}
      <div className="px-5 md:px-10 lg:px-20 pt-16 md:pt-24">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Zur Startseite
          </Link>

          <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
            Ihr perfekter Tag
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            Helgoland Tagesausflug
          </h1>
          <p className="text-lg md:text-xl text-dark/60 leading-relaxed mb-16 max-w-3xl">
            Als Tagesgast haben Sie etwa 4 bis 6 Stunden auf Helgoland. Mit der
            richtigen Planung erleben Sie alle Highlights der Insel. Hier ist
            unser bewährter Zeitplan für den perfekten Tagesausflug.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 md:px-10 lg:px-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-10">
            Ihr Tagesplan
          </h2>
          <div className="space-y-8">
            {timelineSteps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{i + 1}</span>
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/10 mt-2" />
                  )}
                </div>
                <div className="pb-8">
                  <p className="text-sm text-primary font-semibold mb-1">{step.time}</p>
                  <h3 className="text-lg font-bold text-dark mb-2">{step.title}</h3>
                  <p className="text-dark/60 text-base leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-8">
            Tipps für Ihren Tagesausflug
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="text-dark/70 text-sm leading-relaxed">
                  <span className="text-primary font-bold mr-2">Tipp {i + 1}:</span>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 md:px-10 lg:px-20 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            Starten Sie Ihren Tagesausflug mit der Inselbahn
          </h2>
          <p className="text-dark/60 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt Ihre Inselbahn-Tour und sichern Sie sich Ihren
            Platz. Abfahrt ab Lung Wai, nur wenige Minuten von allen
            Fähranlegern entfernt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#buchung"
              className="inline-flex items-center gap-2 bg-dark text-white px-8 py-3.5 rounded-full font-semibold hover:bg-dark/85 transition-colors"
            >
              Jetzt buchen
            </Link>
            <Link
              href="/helgoland-sehenswuerdigkeiten"
              className="inline-flex items-center gap-2 border border-dark/20 text-dark px-8 py-3.5 rounded-full font-semibold hover:bg-dark/5 transition-colors"
            >
              Sehenswürdigkeiten ansehen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
