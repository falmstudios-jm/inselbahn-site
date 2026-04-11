import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Helgoland Tour | Welche Rundfahrt passt zu Ihnen?",
  description:
    "Helgoland Tour: Premium-Tour (90 Min, ab 22 EUR) oder Unterland-Tour (45 Min, ab 11 EUR). Vergleich, Route und Online-Buchung.",
  keywords: [
    "helgoland tour",
    "helgoland rundfahrt",
    "beste tour helgoland",
    "helgoland inselrundfahrt",
  ],
  alternates: {
    canonical: "https://www.helgolandbahn.de/helgoland-tour",
  },
  openGraph: {
    title: "Helgoland Tour | Welche Rundfahrt passt zu Ihnen?",
    description:
      "Helgoland Tour: Premium-Tour (90 Min, ab 22 EUR) oder Unterland-Tour (45 Min, ab 11 EUR). Vergleich, Route und Online-Buchung.",
    url: "https://www.helgolandbahn.de/helgoland-tour",
    siteName: "Inselbahn Helgoland",
    locale: "de_DE",
    type: "article",
  },
};

const faqItems = [
  {
    question: "Wie lange dauert die Tour?",
    answer:
      "Die Premium-Tour dauert ca. 90 Minuten inklusive 30 Minuten freier Erkundung an der Langen Anna. Die Unterland-Tour dauert ca. 45 Minuten.",
  },
  {
    question: "Kann ich auch bei Regen fahren?",
    answer:
      "Ja, beide Touren finden bei jedem Wetter statt. Die Fahrzeuge sind überdacht, sodass Sie auch bei Regen trocken bleiben.",
  },
  {
    question: "Sind Hunde erlaubt?",
    answer:
      "Hunde sind bei der Unterland-Tour willkommen. Bei der Premium-Tour können Hunde leider nicht mitgenommen werden.",
  },
  {
    question: "Ist die Tour barrierefrei?",
    answer:
      "Die Unterland-Tour ist vollständig barrierefrei. Die Premium-Tour führt über teils unbefestigte Wege und ist daher nicht barrierefrei.",
  },
  {
    question: "Wo ist der Treffpunkt?",
    answer:
      "Beide Touren starten am Franz-Schensky-Platz im Unterland, direkt in der Nähe der Landungsbrücke.",
  },
  {
    question: "Kann ich online buchen?",
    answer:
      "Ja, Sie können beide Touren bequem online buchen. Tickets sind auch vor Ort am Franz-Schensky-Platz erhältlich.",
  },
  {
    question: "Was ist der Unterschied zur Börtebootrundfahrt?",
    answer:
      "Die Börtebootrundfahrt führt vom Wasser aus um die Insel. Unsere Touren fahren mit elektrischen Fahrzeugen über die Insel und bieten Ausstiege, Fotostopps und einen persönlichen Guide.",
  },
];

const personaCards = [
  {
    persona: "Erstbesucher",
    tour: "Premium-Tour",
    reason: "Komplette Insel in 90 Minuten - Unter- und Oberland mit Langer Anna",
    color: "bg-[#1B2A4A]",
    textColor: "text-white",
  },
  {
    persona: "Familien mit Kindern",
    tour: "Unterland-Tour",
    reason: "Kinder fahren täglich um 14:30 Uhr kostenlos!",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Senioren / eingeschränkte Mobilität",
    tour: "Unterland-Tour",
    reason: "Vollständig barrierefrei, ohne Steigungen",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Naturliebhaber / Vogelbeobachter",
    tour: "Premium-Tour",
    reason: "30 Min am Lummenfelsen - Deutschlands einzige Brutkolonie",
    color: "bg-[#1B2A4A]",
    textColor: "text-white",
  },
  {
    persona: "Wenig Zeit (Tagesgast)",
    tour: "Unterland-Tour",
    reason: "Nur 45 Minuten - perfekt zwischen Ankunft und Abfahrt",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Das volle Erlebnis",
    tour: "Premium-Tour",
    reason: "90 Minuten, komplette Insel, Oberland, Lange Anna",
    color: "bg-[#1B2A4A]",
    textColor: "text-white",
  },
];

export default function HelgolandTourPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* 1. Hero */}
        <section className="relative w-full h-[50vh] min-h-[400px] md:h-[60vh]">
          <Image
            src="/images/extra-img_2202-2.jpg"
            alt="Helgoland Tour mit der Inselbahn - Blick auf die roten Klippen"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-5 text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">
              Helgoland Tour - Welche Rundfahrt passt zu Ihnen?
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Zwei Touren, ein Ziel: Helgoland erleben. Finden Sie die perfekte Tour
              für Ihren Besuch.
            </p>
          </div>
        </section>

        {/* 2. Unsere beliebteste Tour */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <span className="absolute top-4 left-4 z-10 bg-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
                  Beliebteste Tour
                </span>
                <Image
                  src="/images/extra-img_2207-large.jpeg"
                  alt="Premium-Tour Helgoland - elektrischer Oldtimer vor den roten Klippen"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
                  Unsere beliebteste Tour
                </h2>
                <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
                  Die Premium-Tour ist das Highlight für die meisten Besucher. In einer
                  kleinen Gruppe (max. 14 Personen) fahren Sie in einem elektrischen
                  Oldtimer-Unikat durch das gesamte Unter- und Oberland. Ihr persönlicher
                  Guide erzählt Ihnen alles über die Insel - von den Hummerbuden über
                  den Leuchtturm bis zur Langen Anna.
                </p>
                <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-6">
                  Das Besondere: 30 Minuten freie Erkundung am Lummenfelsen und der
                  Langen Anna - Deutschlands einziger Seevogel-Brutkolonie.
                </p>
                <p className="text-2xl font-bold text-dark mb-6">
                  ab 22 EUR <span className="text-base font-normal text-dark/50">pro Person</span>
                </p>
                <Link
                  href="/#buchung"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Jetzt buchen
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Tour-Vergleich */}
        <section className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4 text-center">
              Tour-Vergleich
            </h2>
            <p className="text-dark/60 text-center text-base md:text-lg mb-12 max-w-2xl mx-auto">
              Beide Touren starten am Franz-Schensky-Platz. Hier sehen Sie alle
              Unterschiede auf einen Blick.
            </p>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Premium-Tour Column */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative aspect-[16/9]">
                  <Image
                    src="/images/extra-img_2202-2.jpg"
                    alt="Premium-Tour Fahrzeug"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#1B2A4A]/60 flex items-center justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Premium-Tour</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    ["Dauer", "ca. 90 Minuten"],
                    ["Preis Erwachsene", "ab 22 EUR"],
                    ["Preis Kinder (4-14)", "ab 15 EUR"],
                    ["Max. Personen", "14"],
                    ["Oberland", "Ja"],
                    ["Lange Anna", "Ja (30 Min Ausstieg)"],
                    ["Barrierefrei", "Nein"],
                    ["Hunde", "Nein"],
                    ["Besonderheit", "2025 Sonderanfertigung von INTAMIN, persönlicher Guide"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-dark/50 font-medium">{label}</span>
                      <span className="text-sm font-semibold text-[#1B2A4A] text-right max-w-[50%]">{value}</span>
                    </div>
                  ))}
                  <Link
                    href="/#buchung"
                    className="block w-full text-center bg-[#1B2A4A] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#1B2A4A]/90 transition-colors mt-4"
                  >
                    Premium-Tour buchen
                  </Link>
                </div>
              </div>

              {/* Unterland-Tour Column */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="relative aspect-[16/9]">
                  <Image
                    src="/images/unterland-main.jpg"
                    alt="Unterland-Tour Fahrzeug"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-amber-500/60 flex items-center justify-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Unterland-Tour</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    ["Dauer", "ca. 45 Minuten"],
                    ["Preis Erwachsene", "ab 11 EUR"],
                    ["Preis Kinder (4-14)", "ab 7 EUR"],
                    ["Max. Personen", "28"],
                    ["Oberland", "Nein"],
                    ["Lange Anna", "Nein"],
                    ["Barrierefrei", "Ja"],
                    ["Hunde", "Ja"],
                    ["Besonderheit", "Elektrische Bimmelbahn, Kinder 14:30 Uhr gratis"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-dark/50 font-medium">{label}</span>
                      <span className="text-sm font-semibold text-amber-600 text-right max-w-[50%]">{value}</span>
                    </div>
                  ))}
                  <Link
                    href="/#buchung"
                    className="block w-full text-center bg-amber-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-amber-500/90 transition-colors mt-4"
                  >
                    Unterland-Tour buchen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Was sehe ich bei der Premium-Tour? */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Was sehe ich bei der Premium-Tour?
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8">
              90 Minuten durch die gesamte Insel - vom Unterland über das Oberland
              bis zur Langen Anna. Ihr persönlicher Guide erzählt Geschichten und
              Fakten, die kein Reiseführer kennt.
            </p>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-10">
              <Image
                src="/images/premium-20250807_151052.jpg"
                alt="Premium-Tour Route auf Helgoland"
                fill
                className="object-cover"
              />
            </div>

            <h3 className="text-xl font-bold text-dark mb-6">Die Route</h3>
            <ol className="space-y-6 mb-10">
              {[
                {
                  title: "Franz-Schensky-Platz (Start)",
                  desc: "Treffpunkt im Herzen des Unterlands. Hier steigen Sie in Ihren elektrischen Oldtimer - eine 2025 Sonderanfertigung von INTAMIN.",
                },
                {
                  title: "Unterland - Landungsbrücke, Südstrandpromenade",
                  desc: "Entlang der neugestalteten Promenade mit Blick auf den Südstrand, die Düne und die Landungsbrücke.",
                },
                {
                  title: "Hummerbuden & Binnenhafen (Scheibenhafen)",
                  desc: "Die farbenfrohen Hummerbuden mit Galerien, Schmuck und Gastronomie. Der Binnenhafen heißt Scheibenhafen, weil hier einst die Zielscheiben der britischen Marine lagerten.",
                },
                {
                  title: "Hermann Marwede & AWI",
                  desc: "Vorbei am Seenotrettungskreuzer Hermann Marwede (46 m lang, der größte an der deutschen Küste, 15 Mio. EUR aus Spenden) und dem Alfred-Wegener-Institut mit seinem Hummer-Zuchtprogramm.",
                },
                {
                  title: "Auffahrt ins Oberland",
                  desc: "Über den Invasorenpfad und das Mittelland hinauf aufs Oberland (Helgoländisch: deät Bopperlun).",
                },
                {
                  title: "Am Pinneberg vorbei, Leuchtturm, Kleingärten",
                  desc: "Am Pinneberg (61,3 m) vorbei, am Leuchtturm mit dem stärksten Leuchtfeuer Deutschlands (ursprünglich ein Flak-Turm), vorbei an ca. 70 Kleingärten - die Kartoffeln sind hier in nur 12 Minuten gar, weil Erde und Luft salzhaltig sind.",
                },
                {
                  title: "Lummenfelsen - Vogelkolonien",
                  desc: "Deutschlands kleinstes Naturschutzgebiet: Trottellummen, Basstölpel, Dreizehenmöwen und Tordalke brüten hier - die einzigen Brutplätze in Deutschland.",
                },
                {
                  title: "30 Min freie Erkundung an der Langen Anna",
                  desc: "Sie haben 30 Minuten Zeit, über den barrierefreien Klippenrandweg zur Langen Anna zu gehen. Der 47 m hohe Brandungspfeiler steht unter Naturschutz und kann nur aus der Ferne betrachtet werden.",
                },
                {
                  title: "Rückfahrt",
                  desc: "Zurück über das Oberland, vorbei an Heidschnucken und Gallowayrindern (die als lebendige Rasenmäher dienen), hinunter ins Unterland zum Franz-Schensky-Platz.",
                },
              ].map((stop, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1B2A4A] text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark mb-1">{stop.title}</h4>
                    <p className="text-dark/60 text-sm leading-relaxed">{stop.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Tour-Karte */}
            <div className="my-8">
              <h3 className="text-lg font-bold text-dark mb-3">Tour-Karte</h3>
              <div className="relative w-full rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src="/images/tour-map.jpg"
                  alt="Inselbahn Helgoland Tourenkarte - Premium-Tour und Unterland-Tour Route"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </div>

            <div className="bg-[#1B2A4A]/5 border border-[#1B2A4A]/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-dark mb-3">Wussten Sie?</h3>
              <ul className="space-y-3 text-dark/60 text-sm leading-relaxed">
                <li>
                  - Auf Helgoland gilt ein generelles Hupverbot und Fußgänger haben
                  immer Vorfahrt. Die Inselbahn darf innerorts max. 6 km/h und außerorts
                  max. 10 km/h fahren.
                </li>
                <li>
                  - Im Juni springen junge Trottellummen vom Lummenfelsen ins Meer -
                  der berühmte Lummensprung. Die noch flugunfähigen Küken werden von
                  ihren Eltern im Wasser angelockt.
                </li>
                <li>
                  - Gelegentlich besucht ein Schwarzbrauenalbatros die Kolonie - ein
                  Vogel, der normalerweise nur auf der Südhalbkugel vorkommt.
                </li>
                <li>
                  - Am 18. April 1947 zündeten die Briten die größte nicht-nukleare
                  Sprengung der Welt auf Helgoland - die Detonation war sogar in Hamburg
                  spürbar.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Was sehe ich bei der Unterland-Tour? */}
        <section className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Was sehe ich bei der Unterland-Tour?
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8">
              45 Minuten durch das Unterland - kompakt, barrierefrei und ideal
              für Tagesgäste, Familien und alle, die Helgoland entspannt kennenlernen
              möchten.
            </p>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-10">
              <Image
                src="/images/unterland-main.jpg"
                alt="Unterland-Tour auf Helgoland"
                fill
                className="object-cover"
              />
            </div>

            <h3 className="text-xl font-bold text-dark mb-6">Die Route</h3>
            <ol className="space-y-6 mb-10">
              {[
                {
                  title: "Franz-Schensky-Platz (Start)",
                  desc: "Treffpunkt im Unterland. Sie fahren mit der elektrischen Bimmelbahn los.",
                },
                {
                  title: "Landungsbrücke & Südstrandpromenade",
                  desc: "Entlang der Küste mit Blick auf den Südstrand und die Düne.",
                },
                {
                  title: "Hummerbuden & historischer Binnenhafen",
                  desc: "Die bunten Hummerbuden am Scheibenhafen mit Fotostopp. Galerien, Gastronomie, Standesamt und der Naturschutzverein Jordsand.",
                },
                {
                  title: "Hermann Marwede Seenotrettungskreuzer",
                  desc: "Der größte Seenotrettungskreuzer an der deutschen Küste - 46 Meter lang, ausschließlich aus Spenden finanziert.",
                },
                {
                  title: "Alfred-Wegener-Institut (Hummerzucht)",
                  desc: "Das AWI betreibt hier ein Zuchtprogramm zur Wiederansiedlung des Helgoländer Hummers. Das alte Aquarium wird zum Bluehouse Helgoland umgebaut.",
                },
                {
                  title: "Nordostland mit Fotostopp (Blick auf Klippen Ostseite)",
                  desc: "Fotostopp mit Blick auf die beeindruckenden Klippen von der Ostseite. Hier sehen Sie die roten Buntsandstein-Felsen aus einer einzigartigen Perspektive.",
                },
                {
                  title: "Rückfahrt zum Franz-Schensky-Platz",
                  desc: "Zurück zum Ausgangspunkt - genug Zeit für einen anschliessenden Bummel durch die Einkaufsstraße Lung Wai.",
                },
              ].map((stop, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark mb-1">{stop.title}</h4>
                    <p className="text-dark/60 text-sm leading-relaxed">{stop.desc}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="text-amber-800 font-semibold text-lg mb-1">
                Kinder fahren täglich um 14:30 Uhr kostenlos!
              </p>
              <p className="text-amber-700 text-sm">
                Bei der Unterland-Tour um 14:30 Uhr fahren alle Kinder gratis mit.
                Ideal für Familien mit kleinem Budget.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Für wen ist welche Tour? */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4 text-center">
              Für wen ist welche Tour?
            </h2>
            <p className="text-dark/60 text-center text-base md:text-lg mb-12 max-w-2xl mx-auto">
              Nicht sicher, welche Tour die richtige ist? Hier finden Sie unsere Empfehlung.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {personaCards.map((card) => (
                <div
                  key={card.persona}
                  className={`${card.color} ${card.textColor} rounded-2xl p-6 flex flex-col`}
                >
                  <p className="text-sm font-medium opacity-80 mb-2">Empfehlung fuer</p>
                  <h3 className="text-xl font-bold mb-3">{card.persona}</h3>
                  <p className="text-sm opacity-90 leading-relaxed mb-4 flex-grow">
                    {card.reason}
                  </p>
                  <p className="text-lg font-bold">{card.tour}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Weitere Fragen - Link zur Hauptseite */}
        <section className="bg-surface px-5 md:px-10 lg:px-20 py-12 md:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-dark/60 text-base mb-4">Weitere Fragen zu unseren Touren?</p>
            <Link
              href="/#faq"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              Alle häufig gestellten Fragen ansehen
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        </section>

        {/* 8. CTA */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-6">
              Jetzt Tour buchen
            </h2>
            <Link
              href="/#buchung"
              className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Zur Online-Buchung
            </Link>
            <p className="text-dark/40 text-sm mt-4">
              Online-Buchung empfohlen - Tickets auch vor Ort erhältlich
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
