import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Die Lange Anna | Helgolands berühmtes Wahrzeichen erleben",
  description:
    "Alles über die Lange Anna auf Helgoland. 47 Meter hoher Felsen, Lummenfelsen und Vogelkolonien. Mit der Premium-Tour inkl. 30 Min Aufenthalt.",
  keywords: [
    "Lange Anna",
    "Lange Anna Helgoland",
    "Helgoland Wahrzeichen",
    "Helgoland Felsen",
    "Helgoland Sehenswürdigkeiten",
    "Inselbahn Premium-Tour",
    "Helgoland Klippen",
  ],
  alternates: {
    canonical: "https://helgolandbahn.de/lange-anna",
  },
  openGraph: {
    title: "Die Lange Anna | Helgolands berühmtes Wahrzeichen erleben",
    description:
      "Alles über die Lange Anna auf Helgoland. 47 Meter hoher Felsen, Lummenfelsen und Vogelkolonien. Mit der Premium-Tour inkl. 30 Min Aufenthalt.",
    url: "https://helgolandbahn.de/lange-anna",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "article",
  },
};

export default function LangeAnnaPage() {
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

          <span className="inline-block border border-primary text-primary rounded-full px-5 py-1.5 text-sm font-medium mb-4">
            Helgolands Wahrzeichen
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-dark mb-6 leading-tight">
            Die Lange Anna
          </h1>
          <p className="text-lg md:text-xl text-dark/60 leading-relaxed mb-16 max-w-3xl">
            Der 47 Meter hohe freistehende Brandungspfeiler an der Nordwestspitze
            Helgolands ist das Wahrzeichen der Insel und eines der bekanntesten
            Naturdenkmäler Deutschlands.
          </p>
        </div>
      </div>

      {/* Content sections */}
      <div className="px-5 md:px-10 lg:px-20 pb-20 md:pb-28">
        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Ein Naturdenkmal mit Geschichte
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
              Die Lange Anna besteht aus rotem Buntsandstein und ist das Überbleibsel
              einer ehemaligen Felsbrücke, die vor Jahrhunderten durch die Kraft
              der Nordsee abgetrennt wurde. Mit ihren 47 Metern Höhe und einer
              Grundfläche von etwa 180 Quadratmetern ist sie ein beeindruckendes
              Zeugnis der Naturgewalten. Der charakteristische rote Buntsandstein
              ist dasselbe Gestein, das die gesamte Insel prägt und Helgoland
              seine einzigartige Farbe verleiht.
            </p>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed">
              Der Felsen steht unter Naturschutz und darf nicht betreten werden.
              Dennoch bieten die umliegenden Aussichtspunkte spektakuläre Blicke
              auf das Wahrzeichen, besonders bei Sonnenuntergang, wenn der rote
              Sandstein golden leuchtet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Der Lummenfelsen - Heimat tausender Seevögel
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
              Die Lange Anna und die angrenzenden Klippen bilden den berühmten
              Lummenfelsen - Deutschlands kleinstes Naturschutzgebiet und eine
              der bedeutendsten Seevogelkolonien des Landes. In den Sommermonaten
              nisten hier vier Hauptarten: <strong>Trottellummen</strong> (die
              Namensgeber des Felsens), <strong>Basstölpel</strong> mit ihrer
              beeindruckenden Flügelspannweite, <strong>Dreizehenmöwen</strong> und
              die seltenen <strong>Tordalke</strong>.
            </p>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
              Das spektakulärste Naturschauspiel ist der <strong>Lummensprung
              im Juni</strong>: Die noch flugunfähigen Trottellummen-Küken springen
              in der Abenddämmerung von den bis zu 40 Meter hohen Klippen ins Meer,
              wo ihre Väter sie bereits rufend erwarten. Dieses einzigartige Ereignis
              lockt jedes Jahr Naturbeobachter aus ganz Europa an.
            </p>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed">
              Besondere Aufmerksamkeit erregt auch der gelegentliche Besuch eines
              <strong> Schwarzbrauenalbatros</strong> - ein Irrgast der Südhalbkugel,
              der die Helgoländer Kolonie manchmal für mehrere Wochen besucht und
              für Aufsehen unter Vogelkundlern sorgt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Der Klippenrandweg
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed">
              Der ca. 3 Kilometer lange Klippenrandweg f&uuml;hrt entlang der gesamten
              Oberkante der roten Felsklippen und bietet durchgehend atemberaubende
              Ausblicke auf die Nordsee und nat&uuml;rlich die Lange Anna.
              Bei unserer Premium-Tour haben Sie einen exklusiven 30-min&uuml;tigen
              Ausstieg an der Langen Anna, bei dem Sie einen Teil des Klippenrandwegs
              selbst erkunden und die Brutv&ouml;gel beobachten k&ouml;nnen -
              sie br&uuml;ten nur hier in Deutschland. Der Weg ist gut
              befestigt und ausgeschildert, festes Schuhwerk wird dennoch empfohlen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
              Die Lange Anna mit der Inselbahn erleben
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-6">
              Unsere Premium-Tour ist die beste M&ouml;glichkeit, die Lange Anna zu
              erleben. Die Tour f&uuml;hrt Sie durch das Ober- und Unterland direkt
              zum Wahrzeichen, wo Sie einen exklusiven 30-min&uuml;tigen Ausstieg
              haben. Erkunden Sie den Klippenrandweg, bestaunen Sie die Lange Anna
              aus n&auml;chster N&auml;he und beobachten Sie die Brutv&ouml;gel -
              Trottellummen, Basst&ouml;lpel, Dreizehenm&ouml;wen und Tordalke,
              die nur hier in Deutschland br&uuml;ten. Ganz ohne den anstrengenden
              Fu&szlig;weg bew&auml;ltigen zu m&uuml;ssen.
            </p>
            <div className="bg-surface rounded-2xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-dark mb-3">
                Premium-Tour mit Ausstieg an der Langen Anna
              </h3>
              <ul className="space-y-2 text-dark/60 text-sm mb-4">
                <li className="flex items-start gap-2.5">
                  <span className="text-green mt-0.5 font-bold">&#10003;</span>
                  Ca. 90 Minuten geführte Tour
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green mt-0.5 font-bold">&#10003;</span>
                  30 Minuten freie Erkundung an der Langen Anna
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green mt-0.5 font-bold">&#10003;</span>
                  Kleine Gruppe (max. 18 Personen)
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-green mt-0.5 font-bold">&#10003;</span>
                  Ober- und Unterland komplett
                </li>
              </ul>
              <p className="text-dark font-semibold">
                Ab 22&euro; (Erwachsene) / 15&euro; (Kinder unter 15)
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">
            Die Lange Anna hautnah erleben
          </h2>
          <p className="text-dark/60 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Buchen Sie jetzt die Premium-Tour mit Ausstieg an der
            Langen Anna. Täglich mehrere Abfahrten ab dem Franz-Schensky-Platz.
          </p>
          <Link
            href="/#buchung"
            className="inline-flex items-center gap-2 bg-dark text-white px-8 py-3.5 rounded-full font-semibold hover:bg-dark/85 transition-colors"
          >
            Premium-Tour buchen
          </Link>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
}
