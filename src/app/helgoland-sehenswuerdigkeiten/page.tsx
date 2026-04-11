import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Helgoland Sehenswürdigkeiten - Die schönsten Highlights der Insel",
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
    title: "Helgoland Sehenswürdigkeiten - Die schönsten Highlights der Insel",
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
      "Helgolands ber\u00fchmtes Wahrzeichen ist ein 47 Meter hoher freistehender Brandungspfeiler aus rotem Buntsandstein an der Nordwestspitze der Insel. Der markante Felsen, \u00dcberbleibsel einer ehemaligen Felsbr\u00fccke, ist das meistfotografierte Motiv Helgolands. Er steht unter Naturschutz und darf nicht betreten oder direkt angen\u00e4hert werden. Von den umliegenden Aussichtspunkten am Klippenrandweg bieten sich spektakul\u00e4re Fotomotive - besonders bei Sonnenuntergang, wenn der rote Sandstein golden leuchtet.",
    tip: "Mit unserer Premium-Tour erreichen Sie die Lange Anna bequem und haben einen exklusiven 30-min\u00fctigen Ausstieg, bei dem Sie den Klippenrandweg selbst erkunden, die Lange Anna bestaunen und die Brutv\u00f6gel beobachten k\u00f6nnen - die einzige Brutkolonie dieser Art in Deutschland.",
  },
  {
    title: "Die Hummerbuden",
    description:
      "Die farbenfrohen Hummerbuden am Binnenhafen (von Helgol\u00e4ndern auch \u201eScheibenhafen\u201c genannt - nach den britischen Zielscheiben, die hier einst lagerten) sind das Herzst\u00fcck des Unterlands. Die bunten Holzh\u00fctten dienten einst als Fischerschuppen und beherbergen heute Galerien, Schmuckl\u00e4den, Gastronomie, ein Standesamt (ja, man kann hier heiraten!), den Naturschutzverein Jordsand, den Souvenirladen \u201eRoter Flint\u201c und die James-Kr\u00fcss-\u00d6nnerb\u00fcnsken-Bude. Achtung: Die M\u00f6wen auf Helgoland sind dreist und stehlen einem gerne das Fischbr\u00f6tchen direkt aus der Hand!",
    tip: "Die Hummerbuden sind Teil unserer Unterland-Tour mit Fotostopp. Unser Tipp: Fischbrötchen erst nach der Tour genießen - sicher vor Möwen!",
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
    tip: "Unsere Premium-Tour f\u00fchrt Sie durch das gesamte Oberland am Pinneberg vorbei - ohne den steilen Aufstieg zu Fu\u00df.",
  },
  {
    title: "Der Lummenfelsen",
    description:
      "Deutschlands kleinstes Naturschutzgebiet ist Heimat tausender Seevögel: Trottellummen, Basstölpel, Dreizehenmöwen und Tordalke brüten hier in den Sommermonaten. Das spektakulärste Naturschauspiel ist der \u201eLummensprung\u201c im Juni, wenn die noch flugunfähigen Küken von den Klippen ins Meer springen. Gelegentlich besucht sogar ein Schwarzbrauenalbatros die Kolonie - ein extrem seltener Gast!",
    tip: "Bei der Premium-Tour haben Sie einen exklusiven 30-min\u00fctigen Ausstieg am Lummenfelsen, bei dem Sie den Klippenrandweg selbst erkunden und die Brutv\u00f6gel aus n\u00e4chster N\u00e4he beobachten k\u00f6nnen - sie br\u00fcten nur hier in Deutschland.",
  },
  {
    title: "Hermann Marwede - Seenotrettungskreuzer",
    description:
      "Der 46 Meter lange Seenotrettungskreuzer Hermann Marwede der DGzRS liegt im S\u00fcdhafen und ist der gr\u00f6\u00dfte Rettungskreuzer an der deutschen K\u00fcste. Das Schiff kostete rund 15 Millionen Euro, die ausschlie\u00dflich aus Spenden finanziert wurden. Seit der Indienststellung 2003 hat die Crew zahlreiche Menschenleben auf der Nordsee gerettet.",
    tip: "Wenn die Hermann Marwede im Hafen liegt, k\u00f6nnen Sie sie von der Unterland-Tour aus sehen.",
  },
  {
    title: "Alfred-Wegener-Institut (AWI)",
    description:
      "Das AWI betreibt auf Helgoland eine bedeutende Meeresforschungsstation. Besonders bekannt ist das Hummer-Zuchtprogramm zur Wiederansiedlung des Helgoländer Hummers. Das alte Aquarium wird derzeit zum \u201eBluehouse Helgoland\u201c umgebaut - einer neuen Multimillionen-Attraktion für Besucher, die die faszinierende Unterwasserwelt der Nordsee erlebbar macht.",
    tip: "Das AWI liegt auf der Route unserer Unterland-Tour. Fragen Sie unseren Guide nach dem Hummer-Zuchtprogramm!",
  },
  {
    title: "Die Düne mit Rotem Flint",
    description:
      "Die Nachbarinsel (1000 x 700 m, ca. 130.000 m² Strand) wurde 1721 durch einen verheerenden Sturm von der Hauptinsel getrennt. Die Dünenfähre \u201eWitte Kliff\u201c hat seit 1996 über 8 Millionen Fahrgäste befördert und fährt alle 30 Minuten (6 € Erwachsene, halber Preis für Kinder). Hier liegt der weltweit einzigartige Rote Flint - ein roter Feuerstein, der nur auf Helgolands Düne vorkommt. Die neugierigen und furchtlosen Kegelrobben und Seehunde am Strand sind ein unvergessliches Erlebnis.",
    tip: "Bei der Unterland-Tour erhalten Sie einen Fotostopp im Nordostland mit Blick auf die Klippen von der Ostseite. Planen Sie extra Zeit f\u00fcr die D\u00fcnenf\u00e4hre ein!",
  },
  {
    title: "Das Nordostgel\u00e4nde",
    description:
      "Das Nordostgel\u00e4nde ist ein geschichtstr\u00e4chtiger Teil der Insel. Hier sollte im Rahmen des \u201eHummerschere\u201c-Projekts ein gigantischer Kriegshafen entstehen - die Pl\u00e4ne wurden nie vollendet. Heute befinden sich im Nordostland unter anderem die Jugendherberge, der Nordoststrand und der Fu\u00dfballplatz des VfL Fosite Helgoland. Der \u201eBig Bang\u201c vom 18. April 1947 - die gr\u00f6\u00dfte nicht-nukleare Explosion der Geschichte - fand im heutigen Mittelland statt und schuf die Landschaft, die Sie dort heute sehen. Die Detonation war bis Hamburg zu h\u00f6ren.",
    tip: "Beide Touren f\u00fchren durch das Nordostland. Unser Guide erz\u00e4hlt die dramatische Geschichte des Big Bang von 1947 und des Hummerschere-Projekts.",
  },
];

export default function SehenswuerdigkeitenPage() {
  return (
    <>
      <Header />
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
      <Footer />
    </>
  );
}
