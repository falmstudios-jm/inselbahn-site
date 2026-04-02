import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AGB — Inselbahn Helgoland",
  description:
    "Allgemeine Geschäftsbedingungen der Helgoländer Dienstleistungs GmbH für die Inselbahn Helgoland.",
};

export default function AGBPage() {
  return (
    <main className="min-h-screen bg-white px-5 md:px-10 lg:px-20 py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium mb-10 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zur Startseite
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-dark mb-10">
          Allgemeine Gesch&auml;ftsbedingungen
        </h1>

        <div className="space-y-10 text-dark/70 text-base leading-relaxed">
          {/* §1 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;1 Geltungsbereich
            </h2>
            <p>
              Diese Allgemeinen Gesch&auml;ftsbedingungen (AGB) gelten f&uuml;r
              alle &uuml;ber die Website{" "}
              <a
                href="https://helgolandbahn.de"
                className="text-primary hover:underline"
              >
                helgolandbahn.de
              </a>{" "}
              abgeschlossenen Vertr&auml;ge zwischen der Helgol&auml;nder
              Dienstleistungs GmbH (nachfolgend &bdquo;Anbieter&ldquo;) und dem
              Kunden (nachfolgend &bdquo;Fahrgast&ldquo;) &uuml;ber die
              Durchf&uuml;hrung gef&uuml;hrter Inselrundfahrten auf Helgoland
              sowie den Erwerb von Geschenkgutscheinen.
            </p>
            <p className="mt-2">
              Abweichende Bedingungen des Fahrgastes werden nicht anerkannt, es
              sei denn, der Anbieter stimmt ihrer Geltung ausdr&uuml;cklich
              schriftlich zu.
            </p>
          </section>

          {/* §2 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;2 Vertragsschluss
            </h2>
            <p>
              Die Darstellung der Touren auf der Website stellt ein verbindliches
              Angebot dar. Durch Abschluss des Buchungsvorgangs und Bet&auml;tigung
              der Schaltfl&auml;che &bdquo;Zur Kasse&ldquo; bzw. &bdquo;Jetzt
              buchen&ldquo; gibt der Fahrgast eine verbindliche Vertragserkl&auml;rung
              ab. Der Vertrag kommt mit erfolgreicher Zahlungsbest&auml;tigung
              zustande.
            </p>
            <p className="mt-2">
              Der Fahrgast erh&auml;lt eine Buchungsbest&auml;tigung per E-Mail
              mit Buchungsnummer, Tourdetails und Fahrkarte. Diese E-Mail dient
              als Nachweis des Vertragsschlusses.
            </p>
          </section>

          {/* §3 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;3 Preise und Zahlung
            </h2>
            <p>
              Alle auf der Website genannten Preise sind Endpreise in Euro.
              Helgoland ist gem&auml;&szlig; &sect;1 Abs. 2 UStG kein Inland im
              Sinne des Umsatzsteuergesetzes. Daher wird{" "}
              <strong>keine Umsatzsteuer erhoben</strong>. Die angegebenen Preise
              sind somit Nettopreise, die gleichzeitig Endpreise darstellen.
            </p>
            <p className="mt-2">
              Die Zahlung erfolgt online &uuml;ber den Zahlungsdienstleister
              Stripe. Akzeptiert werden g&auml;ngige Kredit- und Debitkarten,
              Apple Pay, Google Pay sowie weitere von Stripe unterst&uuml;tzte
              Zahlungsmethoden. Gutscheine und Rabattcodes k&ouml;nnen bei der
              Buchung eingesetzt werden.
            </p>
          </section>

          {/* §4 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;4 Leistungsbeschreibung
            </h2>
            <p>
              Der Anbieter erbringt gef&uuml;hrte Inselrundfahrten mit der
              Inselbahn Helgoland. Die Touren werden gem&auml;&szlig; der auf der
              Website beschriebenen Route, Dauer und Leistungsmerkmale
              durchgef&uuml;hrt.
            </p>
            <p className="mt-2">
              Die Durchf&uuml;hrung der Touren ist wetterabh&auml;ngig. Bei
              ung&uuml;nstigen Wetterbedingungen (Sturm, Gewitter, extreme
              Witterung) oder h&ouml;herer Gewalt beh&auml;lt sich der Anbieter
              das Recht vor, Abfahrten zu verschieben oder abzusagen. In diesem
              Fall wird dem Fahrgast der volle Ticketpreis erstattet oder ein
              Ersatztermin angeboten.
            </p>
            <p className="mt-2">
              Geringf&uuml;gige Abweichungen von der beschriebenen Route
              (z.&nbsp;B. aufgrund von Baustellen oder Sperrungen) berechtigen
              nicht zu Preisminderung.
            </p>
          </section>

          {/* §5 */}
          <section id="stornierung">
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;5 Stornierungsbedingungen
            </h2>
            <p>
              Der Fahrgast kann seine Buchung{" "}
              <strong>
                kostenlos bis Mitternacht (00:00 Uhr) am Tag vor der gebuchten
                Tour
              </strong>{" "}
              stornieren. Die Stornierung erfolgt &uuml;ber den in der
              Buchungsbest&auml;tigung enthaltenen Stornierungslink oder
              &uuml;ber die Stornierungsseite auf der Website.
            </p>
            <p className="mt-2">
              Bei Stornierungen nach Ablauf der Stornierungsfrist oder bei
              Nichterscheinen (No-Show) erfolgt{" "}
              <strong>keine Erstattung</strong> des Ticketpreises.
            </p>
            <p className="mt-2">
              Bei Absage durch den Anbieter (z.&nbsp;B. wegen Wetterbedingungen)
              wird der volle Ticketpreis erstattet.
            </p>
          </section>

          {/* §6 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;6 Widerrufsrecht
            </h2>
            <p>
              <strong>
                Ein Widerrufsrecht besteht bei dieser Dienstleistung nicht.
              </strong>
            </p>
            <p className="mt-2">
              Gem&auml;&szlig; &sect;312g Abs. 2 Nr. 9 BGB steht dem Verbraucher
              bei Vertr&auml;gen zur Erbringung von Dienstleistungen im
              Zusammenhang mit Freizeitbet&auml;tigungen kein Widerrufsrecht zu,
              wenn der Vertrag f&uuml;r die Erbringung einen spezifischen Termin
              vorsieht. Da die gebuchten Inselrundfahrten an einen festen
              Termin (Datum und Uhrzeit) gebunden sind, ist das gesetzliche
              14-t&auml;gige Widerrufsrecht ausgeschlossen.
            </p>
            <p className="mt-2">
              Das vertragliche Stornierungsrecht gem&auml;&szlig; &sect;5 dieser
              AGB bleibt hiervon unber&uuml;hrt.
            </p>
          </section>

          {/* §7 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;7 Haftung
            </h2>
            <p>
              Der Anbieter haftet unbeschr&auml;nkt f&uuml;r Sch&auml;den aus
              der Verletzung des Lebens, des K&ouml;rpers oder der Gesundheit
              sowie f&uuml;r Sch&auml;den, die auf einer vors&auml;tzlichen
              oder grob fahrl&auml;ssigen Pflichtverletzung beruhen.
            </p>
            <p className="mt-2">
              Bei leichter Fahrl&auml;ssigkeit haftet der Anbieter nur bei
              Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In
              diesem Fall ist die Haftung auf den vertragstypischen,
              vorhersehbaren Schaden begrenzt.
            </p>
            <p className="mt-2">
              Der Anbieter haftet nicht f&uuml;r Ausf&auml;lle, Versp&auml;tungen
              oder Einschr&auml;nkungen, die auf h&ouml;here Gewalt,
              au&szlig;ergew&ouml;hnliche Wetterbedingungen, beh&ouml;rdliche
              Anordnungen oder sonstige Umst&auml;nde zur&uuml;ckzuf&uuml;hren
              sind, die au&szlig;erhalb seines Einflussbereichs liegen.
            </p>
          </section>

          {/* §8 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;8 Gutscheine
            </h2>
            <p>
              Geschenkgutscheine der Inselbahn Helgoland sind ab Kaufdatum{" "}
              <strong>2 Jahre g&uuml;ltig</strong>. Das Ablaufdatum ist auf dem
              Gutschein vermerkt bzw. wird in der Kaufbest&auml;tigung
              mitgeteilt.
            </p>
            <p className="mt-2">
              Gutscheine sind nicht bar auszahlbar und k&ouml;nnen nicht gegen
              Bargeld eingetauscht werden. Eine Erstattung des Gutscheinwertes
              ist ausgeschlossen.
            </p>
            <p className="mt-2">
              Eine Teileinl&ouml;sung ist m&ouml;glich. Der verbleibende
              Restwert bleibt bis zum Ablaufdatum erhalten und kann f&uuml;r
              weitere Buchungen verwendet werden. &Uuml;bersteigt der
              Gutscheinwert den Buchungsbetrag, wird der Restbetrag als
              Guthaben auf dem Gutschein belassen.
            </p>
            <p className="mt-2">
              Gutscheine k&ouml;nnen mit Rabattcodes kombiniert werden.
            </p>
          </section>

          {/* §9 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;9 Datenschutz
            </h2>
            <p>
              Der Anbieter verarbeitet personenbezogene Daten des Fahrgastes
              ausschlie&szlig;lich im Rahmen der geltenden
              Datenschutzbestimmungen. Einzelheiten zur Datenverarbeitung
              entnehmen Sie bitte unserer{" "}
              <Link
                href="/datenschutz"
                className="text-primary hover:underline"
              >
                Datenschutzerkl&auml;rung
              </Link>
              .
            </p>
          </section>

          {/* §10 */}
          <section>
            <h2 className="text-lg font-semibold text-dark mb-2">
              &sect;10 Schlussbestimmungen
            </h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss
              des UN-Kaufrechts. F&uuml;r Verbraucher gilt diese Rechtswahl nur
              insoweit, als nicht der durch zwingende Bestimmungen des Rechts
              des Staates des gew&ouml;hnlichen Aufenthaltes des Verbrauchers
              gew&auml;hrte Schutz entzogen wird.
            </p>
            <p className="mt-2">
              Gerichtsstand f&uuml;r alle Streitigkeiten aus oder im
              Zusammenhang mit diesem Vertrag ist, soweit gesetzlich
              zul&auml;ssig, das Amtsgericht Pinneberg.
            </p>
            <p className="mt-2">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
              werden, so ber&uuml;hrt dies die Wirksamkeit der &uuml;brigen
              Bestimmungen nicht. An die Stelle der unwirksamen Bestimmung tritt
              die gesetzliche Regelung.
            </p>
          </section>

          {/* Company info */}
          <section className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-dark mb-2">
              Anbieter
            </h2>
            <p>
              Helgol&auml;nder Dienstleistungs GmbH
              <br />
              Am Falm 302 A
              <br />
              27498 Helgoland
              <br />
              Deutschland
            </p>
            <p className="mt-2">
              E-Mail:{" "}
              <a
                href="mailto:info@helgolandbahn.de"
                className="text-primary hover:underline"
              >
                info@helgolandbahn.de
              </a>
            </p>
          </section>

          <p className="text-sm text-dark/40">
            Stand: April 2026
          </p>
        </div>
      </div>
    </main>
  );
}
