import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Helgoland Sehenswürdigkeiten — Die schönsten Highlights der Insel",
  description:
    "Entdecken Sie die Top-Sehenswürdigkeiten auf Helgoland: Lange Anna, Hummerbuden, Oberland, Lummenfelsen, Düne und Nordostgelände. Am besten zu erleben mit der Inselbahn!",
  keywords: [
    "Helgoland Sehenswürdigkeiten",
    "Lange Anna",
    "Hummerbuden Helgoland",
    "Lummenfelsen",
    "Helgoland Oberland",
    "Helgoland Düne",
    "Helgoland Highlights",
    "Helgoland Aktivitäten",
  ],
  alternates: {
    canonical: "https://helgolandbahn.de/helgoland-sehenswuerdigkeiten",
  },
  openGraph: {
    title: "Helgoland Sehenswürdigkeiten — Die schönsten Highlights der Insel",
    description:
      "Entdecken Sie die Top-Sehenswürdigkeiten auf Helgoland mit der Inselbahn. Lange Anna, Hummerbuden, Oberland und mehr.",
    url: "https://helgolandbahn.de/helgoland-sehenswuerdigkeiten",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "article",
  },
};

const highlights = [
  {
    title: "Die Lange Anna",
    description:
      "Helgolands berühmtes Wahrzeichen ist ein 47 Meter hoher freistehender Felsen an der Nordwestspitze der Insel. Der markante rote Brandungspfeiler ist das meistfotografierte Motiv Helgolands und ein Muss für jeden Besucher.",
    tip: "Mit unserer Premium-Tour erreichen Sie die Lange Anna bequem und haben 30 Minuten freie Erkundungszeit direkt vor Ort.",
  },
  {
    title: "Die Hummerbuden",
    description:
      "Die farbenfrohen Hummerbuden am Binnenhafen sind das Herzstück des Unterlands. Die kleinen bunten Holzhütten, die einst als Fischerschuppen dienten, beherbergen heute Galerien, Souvenirläden und Gastronomiebetriebe.",
    tip: "Die Hummerbuden sind Teil unserer Unterland-Tour und bieten einen wunderbaren Fotostopp.",
  },
  {
    title: "Das Oberland",
    description:
      "Das Oberland thront auf den charakteristischen roten Klippen Helgolands. Von hier genießen Sie atemberaubende Panoramablicke über die Nordsee, die Düne und bei klarer Sicht bis zur Küste. Der Rundweg bietet spektakuläre Ausblicke.",
    tip: "Unsere Premium-Tour führt Sie durch das Oberland, sodass Sie die Aussicht genießen können, ohne den steilen Aufstieg zu Fuß bewältigen zu müssen.",
  },
  {
    title: "Der Lummenfelsen",
    description:
      "Deutschlands kleinster Naturschutzgebiet-Felsen ist Heimat tausender Seevögel. Basstölpel, Trottellummen, Dreizehenmöwen und Tordalken brüten hier in den Sommermonaten. Ein einzigartiges Naturschauspiel, das es so nirgendwo sonst in Deutschland gibt.",
    tip: "Von der Inselbahn aus haben Sie hervorragende Blicke auf den Lummenfelsen, besonders auf der Premium-Tour.",
  },
  {
    title: "Die Düne",
    description:
      "Die Nachbarinsel Helgolands ist bekannt für ihre weißen Sandstrände und die Kegelrobben- und Seehund-Kolonien. Die Düne erreichen Sie mit der Dünenfähre vom Helgoländer Hafen aus.",
    tip: "Bei der Unterland-Tour erhalten Sie einen Fotostopp im Nordostland mit direktem Blick auf die Düne.",
  },
  {
    title: "Das Nordostgelände",
    description:
      "Das Nordostgelände ist ein geschichtsträchtiger Teil der Insel mit Überresten der ehemaligen Marinebefestigungen. Hier erleben Sie die bewegte Vergangenheit Helgolands hautnah und genießen gleichzeitig die wilde, naturbelassene Landschaft.",
    tip: "Beide Touren führen durch das Nordostland, wobei die Premium-Tour mehr Zeit für die Erkundung bietet.",
  },
];

export default function SehenswuerdigkeitenPage() {
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

          <h1 className="text-3xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            Helgoland Sehenswürdigkeiten
          </h1>
          <p className="text-lg md:text-xl text-dark/60 leading-relaxed mb-16 max-w-3xl">
            Helgoland, Deutschlands einzige Hochseeinsel, bietet auf kleinem Raum
            eine beeindruckende Vielfalt an Natur, Geschichte und Kultur. Hier sind
            die schönsten Highlights, die Sie bei Ihrem Besuch nicht verpassen sollten.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="px-5 md:px-10 lg:px-20 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto space-y-16">
          {highlights.map((item, i) => (
            <section key={i} className="border-b border-gray-100 pb-16 last:border-0">
              <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
                {item.title}
              </h2>
              <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
                {item.description}
              </p>
              <div className="bg-primary/5 border border-primary/10 rounded-xl px-5 py-4">
                <p className="text-sm text-dark/70">
                  <span className="font-semibold text-primary">Inselbahn-Tipp:</span>{" "}
                  {item.tip}
                </p>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            Alle Highlights bequem erleben
          </h2>
          <p className="text-dark/60 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Mit der Inselbahn sehen Sie alle Sehenswürdigkeiten Helgolands entspannt
            und ohne anstrengende Fußwege. Geführte Touren ab DEN Lung Wai.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/#touren"
              className="inline-flex items-center gap-2 bg-dark text-white px-8 py-3.5 rounded-full font-semibold hover:bg-dark/85 transition-colors"
            >
              Touren ansehen
            </Link>
            <Link
              href="/#buchung"
              className="inline-flex items-center gap-2 border border-dark/20 text-dark px-8 py-3.5 rounded-full font-semibold hover:bg-dark/5 transition-colors"
            >
              Jetzt buchen
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
