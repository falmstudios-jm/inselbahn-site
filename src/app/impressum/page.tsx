import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Impressum - Inselbahn Helgoland",
  description: "Impressum der Helgoländer Dienstleistungs GmbH, Betreiber der Inselbahn Helgoland.",
};

export default function ImpressumPage() {
  return (
    <>
      <Header />
    <main className="min-h-screen bg-white px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zur Startseite
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-10">
          Impressum
        </h1>

        <div className="space-y-8 text-dark/70 text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Angaben gem&auml;&szlig; &sect; 5 DDG
            </h2>
            <p>
              Helgol&auml;nder Dienstleistungs GmbH<br />
              Von-Aschen-Str. 594<br />
              27498 Helgoland
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Gesch&auml;ftsf&uuml;hrer
            </h2>
            <p>Kay Martens</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Kontakt
            </h2>
            <p>
              Telefon: +49 160 4170905<br />
              E-Mail:{" "}
              <a href="mailto:info@helgolandbahn.de" className="text-primary hover:underline">
                info@helgolandbahn.de
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Handelsregister
            </h2>
            <p>
              HRB 19416 PI<br />
              Amtsgericht Pinneberg
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <p>
              gem&auml;&szlig; &sect; 27a Umsatzsteuergesetz:<br />
              DE173507934
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              Verantwortlich f&uuml;r den Inhalt nach &sect; 18 Abs. 2 MStV
            </h2>
            <p>
              Kay Martens<br />
              Von-Aschen-Str. 594<br />
              27498 Helgoland
            </p>
          </section>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
}
