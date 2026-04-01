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
      "Helgolands berühmtes Wahrzeichen ist ein 47 Meter hoher freistehender Brandungspfeiler aus rotem Buntsandstein an der Nordwestspitze der Insel. Der markante Felsen, Überbleibsel einer ehemaligen Felsbrücke, ist das meistfotografierte Motiv Helgolands. Er steht unter Naturschutz und darf nicht betreten werden, bietet aber von den umliegenden Aussichtspunkten spektakuläre Fotomotive — besonders bei Sonnenuntergang, wenn der rote Sandstein golden leuchtet.",
    tip: "Mit unserer Premium-Tour erreichen Sie die Lange Anna bequem und haben 30 Minuten freie Erkundungszeit direkt vor Ort — ohne den anstrengenden Fußweg.",
  },
  {
    title: "Die Hummerbuden",
    description:
      "Die farbenfrohen Hummerbuden am Binnenhafen (von Helgoländern auch \u201eScheibenhafen\u201c genannt — nach den britischen Zielscheiben, die hier einst lagerten) sind das Herzstück des Unterlands. Die bunten Holzhütten dienten einst als Fischerschuppen und beherbergen heute Galerien, Schmuckläden, Gastronomie, ein Standesamt (ja, man kann hier heiraten!), den Naturschutzverein Jordsand und den Souvenirladen \u201eRoter Flint\u201c. Achtung: Die Möwen auf Helgoland sind dreist und stehlen einem gerne das Fischbrötchen direkt aus der Hand!",
    tip: "Die Hummerbuden sind Teil unserer Unterland-Tour mit Fotostopp. Unser Tipp: Fischbrötchen erst nach der Tour genießen — sicher vor Möwen!",
  },
  {
    title: "Der Leuchtturm",
    description:
      "Der 36 Meter hohe Leuchtturm auf dem Oberland sendet den stärksten Leuchtturmstrahl Deutschlands über die Nordsee. Was viele nicht wissen: Der Turm war ursprünglich ein Flak-Turm aus dem Zweiten Weltkrieg und wurde nach dem Krieg zum Leuchtturm umgebaut. Direkt daneben steht der 113 Meter hohe Richtfunkturm der Telekom.",
    tip: "Auf der Premium-Tour fahren Sie direkt am Leuchtturm vorbei und erfahren seine spannende Geschichte vom Flak-Turm zum Seezeichen.",
  },
  {
    title: "Das Oberland (\u201edeät Bopperlun\u201c)",
    description:
      "Das Oberland thront auf den roten Buntsandstein-Klippen und ist über einen Fahrstuhl oder 182 bis 260 Stufen erreichbar. Der höchste Punkt, der Pinneberg, liegt auf 61,3 Metern. Hier oben befinden sich rund 70 Kleingärten, in denen die Kartoffeln dank des salzigen Bodens in nur 12 Minuten gar sind! Die Vogelwarte beringt jährlich bis zu 15.000 Vögel, und die James-Krüss-Schule unterrichtet Klassen 1 bis 10.",
    tip: "Unsere Premium-Tour führt Sie durch das gesamte Oberland bis zum Pinneberg — ohne den steilen Aufstieg zu Fuß.",
  },
  {
    title: "Der Lummenfelsen",
    description:
      "Deutschlands kleinstes Naturschutzgebiet ist Heimat tausender Seevögel: Trottellummen, Basstölpel, Dreizehenmöwen und Tordalke brüten hier in den Sommermonaten. Das spektakulärste Naturschauspiel ist der \u201eLummensprung\u201c im Juni, wenn die noch flugunfähigen Küken von den Klippen ins Meer springen. Gelegentlich besucht sogar ein Schwarzbrauenalbatros die Kolonie — ein extrem seltener Gast!",
    tip: "Von der Premium-Tour aus haben Sie beste Blicke auf den Lummenfelsen. Der Klippenrandweg (ca. 3 km, ca. 1,5 Stunden) lohnt sich ebenfalls.",
  },
  {
    title: "Hermann Marwede — Seenotrettungskreuzer",
    description:
      "Der 46 Meter lange Seenotrettungskreuzer Hermann Marwede der DGzRS liegt im Südhafen und ist einer der größten Rettungskreuzer an der deutschen Küste. Das Schiff kostete rund 15 Millionen Euro, die ausschließlich aus Spenden finanziert wurden. Seit der Indienststellung 2003 hat die Crew zahlreiche Menschenleben auf der Nordsee gerettet.",
    tip: "Auf der Unterland-Tour fahren Sie direkt am Liegeplatz der Hermann Marwede vorbei und erfahren spannende Rettungsgeschichten.",
  },
  {
    title: "Alfred-Wegener-Institut (AWI)",
    description:
      "Das AWI betreibt auf Helgoland eine bedeutende Meeresforschungsstation. Besonders bekannt ist das Hummer-Zuchtprogramm zur Wiederansiedlung des Helgoländer Hummers. Das alte Aquarium wird derzeit zum \u201eBluehouse Helgoland\u201c umgebaut — einer neuen Multimillionen-Attraktion für Besucher, die die faszinierende Unterwasserwelt der Nordsee erlebbar macht.",
    tip: "Das AWI liegt auf der Route unserer Unterland-Tour. Fragen Sie unseren Guide nach dem Hummer-Zuchtprogramm!",
  },
  {
    title: "Die Düne mit Rotem Flint",
    description:
      "Die Nachbarinsel (1000 x 700 m, ca. 130.000 m² Strand) wurde 1721 durch einen verheerenden Sturm von der Hauptinsel getrennt. Die Dünenfähre \u201eWitte Kliff\u201c hat seit 1996 über 8 Millionen Fahrgäste befördert und fährt alle 30 Minuten (6 € Erwachsene, halber Preis für Kinder). Hier liegt der weltweit einzigartige Rote Flint — ein roter Feuerstein, der nur auf Helgolands Düne vorkommt. Die neugierigen und furchtlosen Kegelrobben und Seehunde am Strand sind ein unvergessliches Erlebnis.",
    tip: "Bei der Unterland-Tour erhalten Sie einen Fotostopp im Nordostland mit direktem Blick auf die Düne. Planen Sie extra Zeit für die Dünenfähre ein!",
  },
  {
    title: "Das Nordostgelände",
    description:
      "Das Nordostgelände ist ein geschichtsträchtiger Teil der Insel mit Überresten der ehemaligen Marinebefestigungen. Am 18. April 1947 sprengten die Briten hier im \u201eBig Bang\u201c die größte nicht-nukleare Explosion der Geschichte — die Detonation war bis Hamburg zu hören und schuf das heutige Mittelland. Heute erleben Sie die wilde, naturbelassene Landschaft und die bewegte Vergangenheit Helgolands hautnah.",
    tip: "Beide Touren führen durch das Nordostland. Unser Guide erzählt die dramatische Geschichte des Big Bang von 1947.",
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
            und ohne anstrengende Fußwege. Geführte Touren ab dem Franz-Schensky-Platz.
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
