import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Helgoland Tour | Welche Rundfahrt passt zu Ihnen?",
  description:
    "Helgoland Tour mit der Inselbahn: Premium-Tour (90 Min, ab 22 EUR) mit Lange Anna oder Unterland-Tour (45 Min, ab 11 EUR). 4,9 Sterne bei Google. Jetzt online buchen.",
  keywords: [
    "helgoland tour",
    "inselbahn helgoland",
    "inselrundfahrt helgoland",
    "helgoland rundfahrt",
    "helgoland bahn",
    "helgoland mit kindern",
    "helgoland oberland unterland",
    "helgoland sehenswürdigkeiten",
    "tagesausflug helgoland",
    "helgoland barrierefrei",
    "lange anna tour",
    "familientag helgoland",
  ],
  alternates: {
    canonical: "https://www.helgolandbahn.de/helgoland-tour",
  },
  openGraph: {
    title: "Helgoland Tour | Welche Rundfahrt passt zu Ihnen?",
    description:
      "Helgoland Tour mit der Inselbahn: Premium-Tour (90 Min, ab 22 EUR) mit Lange Anna oder Unterland-Tour (45 Min, ab 11 EUR). 4,9 Sterne bei Google. Jetzt online buchen.",
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
      "Die Unterland-Tour ist barrierefrei. Sie hat einen festen Rollstuhlplatz und eine Rampe. In der Premium-Tour können wir aus Platzgründen leider keine Rollstühle mitnehmen, der Weg im Oberland selbst ist aber befestigt.",
  },
  {
    question: "Kann ich auf Helgoland ein Fahrrad mieten?",
    answer:
      "Nein. Auf Helgoland gilt ein generelles Fahrradverbot. Sie kommen nur zu Fuß oder mit der Inselbahn voran. Gerade deshalb ist die Premium-Tour der einfachste Weg, das gesamte Oberland mit der Langen Anna ohne Steigungen zu erleben.",
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
    question: "Was ist der Unterschied zur Börteboot-Rundfahrt?",
    answer:
      "Die Börteboot-Rundfahrt umrundet Helgoland vom Wasser aus und zeigt Ihnen die Klippen von der Seeseite. Unsere Inselbahn fährt über die Insel selbst, mit Stopps an Hummerbuden, Hafen und (bei der Premium-Tour) im Oberland an der Langen Anna. Viele Gäste kombinieren beides: erst Inselbahn, dann Börteboot.",
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
    reason: "Familientag: Kinder fahren täglich um 14:30 Uhr kostenlos.",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Senioren / mit Rollstuhl",
    tour: "Unterland-Tour",
    reason: "Rampe und fester Rollstuhlplatz, ohne Steigungen.",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Naturliebhaber & Vogelbeobachter",
    tour: "Premium-Tour",
    reason: "30 Minuten am Klippenrandweg mit Lummenfelsen und Lange Anna.",
    color: "bg-[#1B2A4A]",
    textColor: "text-white",
  },
  {
    persona: "Wenig Zeit (Tagesgast)",
    tour: "Unterland-Tour",
    reason: "Nur 45 Minuten, perfekt zwischen Ankunft und Abfahrt.",
    color: "bg-amber-500",
    textColor: "text-white",
  },
  {
    persona: "Das volle Erlebnis",
    tour: "Premium-Tour",
    reason: "90 Minuten, Kleingruppe (max. 18), komplette Insel inkl. Lange Anna.",
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
            <div className="mb-4 inline-flex items-center gap-2 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold text-dark shadow">
              <span className="text-amber-500">★★★★★</span>
              <span>4,9 / 5 bei 230+ Google-Bewertungen</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-4xl">
              Helgoland Tour - Welche Rundfahrt passt zu Ihnen?
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Mit der Inselbahn Helgoland sehen Sie alle Sehenswürdigkeiten der Insel
              entspannt und ohne anstrengende Fußwege. Zwei Touren, ein Ziel: Helgoland
              wirklich erleben.
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
                  alt="Premium-Tour der Inselbahn Helgoland - vollelektrisches Tour-Fahrzeug vor den roten Klippen"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
                  Unsere beliebteste Tour
                </h2>
                <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-4">
                  Die Premium-Tour ist das Highlight für die meisten Besucher. In
                  einer kleinen Gruppe (max. 18 Personen) fahren Sie in einem neuen,
                  vollelektrischen Tour-Fahrzeug (Sonderanfertigung 2025) durch das
                  gesamte Unter- und Oberland. Ihr persönlicher Guide erzählt Ihnen
                  alles über die Insel, von den Hummerbuden über den Leuchtturm bis
                  zur Langen Anna.
                </p>
                <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-6">
                  Das Besondere: 30 Minuten Aufenthalt am Klippenrandweg. Sie sehen
                  die Lange Anna und den Lummenfelsen in Ruhe aus nächster Nähe, ohne
                  den langen Fußweg mit den vielen Steigungen vom Hafen aus auf sich
                  nehmen zu müssen.
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

        {/* 2b. Warum Inselbahn Helgoland */}
        <section className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4 text-center">
              Warum die Inselbahn Helgoland?
            </h2>
            <p className="text-dark/60 text-center text-base md:text-lg mb-12 max-w-3xl mx-auto">
              Auf Helgoland gilt ein generelles Fahrradverbot. Sie kommen nur zu Fuß
              oder mit der Inselbahn voran. Wir bringen Sie bequem zu allen
              Highlights der Insel, von den Hummerbuden im Unterland bis zur Langen
              Anna im Oberland, in einer Zeit, in der Sie zu Fuß gerade einmal das
              Treppenhaus geschafft hätten.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl font-bold text-primary mb-1">4,9 / 5</div>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Bei über 230 Google-Bewertungen. Die bestbewertete Tour-Attraktion
                  auf Helgoland.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl font-bold text-primary mb-1">100 %</div>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Vollelektrische Fahrzeuge, leise und emissionsfrei. Passend zum
                  autofreien Charakter Helgolands.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl font-bold text-primary mb-1">3</div>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Moderne Fahrzeuge im Einsatz: zwei baugleiche Premium-Tour-Fahrzeuge
                  und eine elektrische Bimmelbahn für die Unterland-Tour.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="text-3xl font-bold text-primary mb-1">25+</div>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Jahre Erfahrung als Helgoländer Familienunternehmen. Wir kennen
                  jeden Stein der Insel und jede Geschichte dahinter.
                </p>
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
                    ["Preis Kinder (6-14)", "ab 15 EUR"],
                    ["Unter 6 Jahren", "kostenlos"],
                    ["Max. Personen", "18 (Kleingruppe)"],
                    ["Oberland", "Ja"],
                    ["Lange Anna & Lummenfelsen", "Ja (30 Min Aufenthalt)"],
                    ["Rollstuhl", "Nicht möglich"],
                    ["Hunde", "Nein"],
                    ["Fahrzeug", "Vollelektrische Sonderanfertigung 2025"],
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
                    ["Preis Kinder (6-14)", "ab 6 EUR"],
                    ["Unter 6 Jahren", "kostenlos"],
                    ["Max. Personen", "42 + 1 Rollstuhl"],
                    ["Oberland", "Nein"],
                    ["Lange Anna & Lummenfelsen", "Nein"],
                    ["Rollstuhl", "Ja (Rampe & fester Platz)"],
                    ["Hunde", "Ja (bis mittelgroß)"],
                    ["Besonderheit", "Familientag: Kinder täglich 14:30 Uhr gratis"],
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
              90 Minuten durch die gesamte Insel, vom Unterland über das Mittelland
              hinauf aufs Oberland (helgoländisch <em>deät Bopperlun</em>) bis zur
              Langen Anna. 30 Minuten Fahrt, 30 Minuten Aufenthalt am Klippenrandweg,
              30 Minuten Rückfahrt. Ihr persönlicher Guide erzählt Ihnen Geschichten
              und Inselalltag-Details, die in keinem Reiseführer stehen.
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
                  desc: "Treffpunkt im Herzen des Unterlands, direkt neben der Tourist-Information. Hier steigen Sie in unser neues, vollelektrisches Tour-Fahrzeug (Sonderanfertigung 2025).",
                },
                {
                  title: "Unterland: Landungsbrücke & Südstrandpromenade",
                  desc: "Entlang der neugestalteten Promenade mit Blick auf den Südstrand, die Düne und die Landungsbrücke der großen Seebäderschiffe.",
                },
                {
                  title: "Hummerbuden & Binnenhafen (Scheibenhafen)",
                  desc: "Die farbenfrohen Hummerbuden mit Galerien, Schmuck und Gastronomie. Der Binnenhafen heißt Scheibenhafen, weil hier einst die Zielscheiben der britischen Marine lagerten.",
                },
                {
                  title: "Hermann Marwede & Alfred-Wegener-Institut",
                  desc: "Mit Blick auf den Seenotrettungskreuzer Hermann Marwede (46 m lang, der größte Rettungskreuzer an der deutschen Küste, vollständig aus Spenden finanziert) und vorbei am Alfred-Wegener-Institut mit seinem Hummer-Zuchtprogramm.",
                },
                {
                  title: "Auffahrt durchs Mittelland aufs Oberland",
                  desc: "Über den Invasorenpfad geht es am Krankenhaus vorbei und ziemlich steil hinauf durchs Mittelland aufs Oberland. Hier oben thront Helgoland auf 61 Metern hohen Buntsandstein-Klippen, ein Anstieg, den Sie zu Fuß so schnell nicht vergessen würden.",
                },
                {
                  title: "Pinneberg, Leuchtturm & Kleingärten",
                  desc: "Am Pinneberg (61,3 m, höchster Punkt Helgolands) vorbei, am Leuchtturm mit dem stärksten Leuchtfeuer Deutschlands (ursprünglich ein Flak-Turm aus dem Zweiten Weltkrieg) und den rund 70 Helgoländer Kleingärten. Wussten Sie? Die Kartoffeln sind hier durch den salzhaltigen Boden in nur 12 Minuten gar.",
                },
                {
                  title: "30 Min Aufenthalt: Lummenfelsen & Lange Anna",
                  desc: "Der Höhepunkt der Tour. Sie haben 30 Minuten Zeit, am Klippenrandweg den Lummenfelsen und die Lange Anna in Ruhe zu erleben. Im Lummenfelsen, Deutschlands kleinstem Naturschutzgebiet, brüten Trottellummen, Basstölpel, Dreizehenmöwen und Tordalke. Die Lange Anna selbst, der 47 m hohe Brandungspfeiler aus rotem Buntsandstein, steht unter Naturschutz und kann nicht betreten werden, ist aber das meistfotografierte Motiv der Insel. Ihr Guide bleibt vor Ort und beantwortet Fragen.",
                },
                {
                  title: "Rückfahrt ins Unterland",
                  desc: "Zurück über das Oberland, vorbei an Heidschnucken und Gallowayrindern (sie dienen als lebendige Rasenmäher im Naturschutzgebiet), und wieder hinunter zum Franz-Schensky-Platz.",
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
                  - Am 18. April 1947 zündeten die Briten im Mittelland Helgolands die
                  größte konventionelle Sprengung der Geschichte (Big Bang). Die
                  Detonation war noch in Hamburg spürbar. Die Krater prägen bis heute
                  Teile der Inseloberfläche.
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
                  desc: "Treffpunkt im Unterland, direkt neben der Tourist-Information am Landungsbrückenvorplatz. Sie steigen in unsere vollelektrische Bimmelbahn ein.",
                },
                {
                  title: "Landungsbrücke & Südstrandpromenade",
                  desc: "Entlang der Promenade vorbei an den großen Anlegern der Seebäderschiffe und mit Blick auf den Südstrand.",
                },
                {
                  title: "Hummerbuden & historischer Binnenhafen",
                  desc: "Die bunten Hummerbuden am sogenannten Scheibenhafen mit Fotostopp. Hier finden Sie Galerien, Schmuck, Gastronomie, ein Standesamt (man kann auf Helgoland heiraten) und den Naturschutzverein Jordsand.",
                },
                {
                  title: "Hermann Marwede Seenotrettungskreuzer",
                  desc: "Der größte Seenotrettungskreuzer an der deutschen Küste, 46 Meter lang, ausschließlich aus Spenden finanziert. Wenn er im Hafen liegt, sehen Sie ihn von der Tour aus.",
                },
                {
                  title: "Alfred-Wegener-Institut (Hummerzucht)",
                  desc: "Das AWI betreibt hier ein Zuchtprogramm zur Wiederansiedlung des berühmten Helgoländer Hummers. Das alte Aquarium wird gerade zum Bluehouse Helgoland umgebaut.",
                },
                {
                  title: "Nordostland mit Fotostopp",
                  desc: "Fotostopp im Nordostland mit Blick auf die beeindruckenden Klippen von der Ostseite Helgolands, eine Perspektive, die viele Tagesgäste sonst nie zu sehen bekommen.",
                },
                {
                  title: "Rückfahrt zum Franz-Schensky-Platz",
                  desc: "Zurück zum Ausgangspunkt mit genug Zeit für einen anschließenden Bummel durch die Einkaufsstraße Lung Wai oder ein Fischbrötchen am Hafen (Achtung vor den Möwen).",
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
                Familientag: Kinder fahren täglich um 14:30 Uhr kostenlos!
              </p>
              <p className="text-amber-700 text-sm">
                Bei der Unterland-Tour um 14:30 Uhr fahren alle Kinder unter 15 Jahren
                gratis mit (in Begleitung mindestens eines zahlenden Erwachsenen).
                Helgoland mit Kindern war nie günstiger.
              </p>
            </div>
          </div>
        </section>

        {/* 5b. Welche Uhrzeit passt zu mir? */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Welche Uhrzeit passt zu Ihnen?
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8">
              Wir bieten unsere Touren über den ganzen Tag verteilt an, damit für jede
              Gästegruppe etwas dabei ist. Den aktuellen{" "}
              <Link href="/#fahrplan" className="text-primary font-semibold hover:underline">
                Fahrplan finden Sie hier
              </Link>
              .
            </p>

            <div className="space-y-4">
              <div className="bg-surface rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">10:00 & 11:00 Uhr - für Übernachtungsgäste</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Sie haben morgens ausgeschlafen, frühstücken in Ruhe und starten
                  entspannt in den Tag. Perfekt, um die Insel kennenzulernen, bevor
                  die Tagesgäste anlegen.
                </p>
              </div>
              <div className="bg-surface rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">12:00 - 14:00 Uhr - für Tagesgäste</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Direkt nach Ankunft der Seebäderschiffe. Sie sehen in kurzer Zeit
                  alle Highlights, ohne dass Ihnen am Ende des Tages noch wichtige
                  Sehenswürdigkeiten fehlen. Ideal, wenn Ihr Schiff am späten
                  Nachmittag wieder ablegt.
                </p>
              </div>
              <div className="bg-surface rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">15:00 & 16:00 Uhr - für angehende Helgoland-Insider</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Die ruhigste Zeit auf der Insel. Wenig Trubel, mehr Zeit für
                  Anekdoten und Hintergrundwissen. Unsere Guides nehmen sich hier
                  besonders viel Zeit für Ihre Fragen, sodass Sie am Ende mehr über
                  Helgoland wissen als so mancher Tourist, der schon zehnmal hier war.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5c. Tipps für Ihren Helgoland-Tagesausflug */}
        <section className="bg-surface px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Tipps für Ihren Helgoland-Tagesausflug
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8">
              Helgoland ist Deutschlands einzige Hochseeinsel und liegt rund 50 km vom
              Festland entfernt. Die Anreise ist Teil des Erlebnisses, die Planung
              dafür auch.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-dark mb-2">Anreise</h3>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Ab Cuxhaven, Büsum, Hamburg, Wedel und Hooksiel verkehren
                  Seebäderschiffe und der schnelle Halunder Jet. Die Fahrzeit
                  variiert je nach Hafen zwischen rund 75 Minuten (Halunder Jet ab
                  Cuxhaven) und gut vier Stunden (Hamburg). Tagesgäste haben in
                  der Regel 4 bis 5 Stunden Aufenthalt auf der Insel, knapp bemessen,
                  aber genau dafür gibt es uns.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark mb-2">Beste Reisezeit</h3>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Mai bis September ist Hauptsaison. Im Juni können Sie mit etwas
                  Glück den berühmten Lummensprung beobachten, wenn die noch
                  flugunfähigen Trottellummen-Küken vom Lummenfelsen ins Meer
                  springen. April und Oktober sind ruhiger, aber auch dann fahren
                  wir bei jedem Wetter, die Fahrzeuge sind überdacht.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark mb-2">Helgoland Oberland & Unterland</h3>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Helgoland besteht aus dem Unterland am Hafen, dem Mittelland und
                  dem hoch oben auf den Buntsandstein-Klippen gelegenen Oberland mit
                  Leuchtturm, Kleingärten und Lange Anna. Zwischen Unter- und Oberland
                  liegen 184 Stufen oder ein Aufzug. Wer die Kraft sparen will, fährt
                  mit der Premium-Tour direkt hinauf.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark mb-2">Was sonst noch?</h3>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Nach der Tour bleibt Zeit für die zollfreie Einkaufsstraße Lung Wai,
                  ein Fischbrötchen am Hafen, einen Abstecher zur Düne (mit Robben
                  und Seehunden) oder eine Börteboot-Rundfahrt vom Wasser aus. Eine
                  vollständige Übersicht der{" "}
                  <Link href="/helgoland-sehenswuerdigkeiten" className="text-primary font-semibold hover:underline">
                    Helgoland Sehenswürdigkeiten finden Sie hier
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5d. Inselbahn vs. Börteboot vs. zu Fuß */}
        <section className="px-5 md:px-10 lg:px-20 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Inselbahn, Börteboot oder zu Fuß?
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8">
              Auf Helgoland gibt es im Wesentlichen drei Arten, die Insel zu erleben.
              Jede hat ihre Vorzüge, viele Gäste kombinieren sie.
            </p>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">Mit der Inselbahn (das sind wir)</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Die schnellste und entspannteste Art, alle Highlights über Land zu
                  sehen, inklusive Oberland, Leuchtturm und Lange Anna. Mit Guide,
                  ohne Steigungen, ohne Stress. In 45 oder 90 Minuten haben Sie
                  Helgoland im Kopf.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">Mit dem Börteboot</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Eine Rundfahrt um die Insel vom Wasser aus. Sie sehen die Klippen,
                  den Lummenfelsen und die Lange Anna von der Seeseite und kommen
                  meistens an Brutvögeln und Robben im Wasser vorbei. Eine schöne
                  Ergänzung zu unserer Inselbahn-Tour, kein Ersatz: vom Boot aus
                  sehen Sie nicht das Oberland, die Hummerbuden oder den
                  Inselalltag.
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <p className="font-bold text-dark mb-1">Zu Fuß</p>
                <p className="text-sm text-dark/60 leading-relaxed">
                  Helgoland ist klein, aber die 184 Stufen zwischen Unter- und Oberland
                  und der Weg zur Langen Anna sind länger und steiler, als viele
                  erwarten. Wer gut zu Fuß ist und mehrere Stunden Zeit hat, kann
                  alles erlaufen. Wer beides will, also alle Highlights und entspannte
                  Beine für den Rest des Tages, kombiniert die Inselbahn mit einem
                  Spaziergang. Fahrräder mieten geht übrigens nicht: auf Helgoland
                  gilt ein generelles Fahrradverbot.
                </p>
              </div>
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
                  <p className="text-sm font-medium opacity-80 mb-2">Empfehlung für</p>
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
            <h2 className="text-2xl md:text-4xl font-bold text-dark mb-4">
              Jetzt Ihre Helgoland Tour buchen
            </h2>
            <p className="text-dark/60 text-base md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
              Sichern Sie sich Ihren Platz in der Inselbahn Helgoland. Online-Buchung
              ist bis zu 3 Tage im Voraus möglich, Tickets sind auch direkt am
              Franz-Schensky-Platz erhältlich.
            </p>
            <Link
              href="/#buchung"
              className="inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Zur Online-Buchung
            </Link>
            <p className="text-dark/40 text-sm mt-4">
              Sie suchen ein Geschenk?{" "}
              <Link href="/gutschein" className="text-primary hover:underline">
                Helgoland Gutscheine
              </Link>{" "}
              gibt es ab 10 EUR und sind 3 Jahre gültig.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
