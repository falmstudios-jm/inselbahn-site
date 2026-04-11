import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Datenschutz - Inselbahn Helgoland",
  description: "Datenschutzerklärung der Helgoländer Dienstleistungs GmbH, Betreiber der Inselbahn Helgoland.",
};

export default function DatenschutzPage() {
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
          Datenschutzerkl&auml;rung
        </h1>

        <div className="space-y-10 text-dark/70 text-base leading-relaxed">
          {/* 1. Verantwortlicher */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              1. Verantwortlicher
            </h2>
            <p>
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
            </p>
            <p className="mt-2">
              Helgol&auml;nder Dienstleistungs GmbH<br />
              Von-Aschen-Str. 594<br />
              27498 Helgoland<br />
              Telefon: +49 160 4170905<br />
              E-Mail:{" "}
              <a href="mailto:info@helgolandbahn.de" className="text-primary hover:underline">
                info@helgolandbahn.de
              </a>
            </p>
            <p className="mt-2">
              Gesch&auml;ftsf&uuml;hrer: Kay Martens
            </p>
          </section>

          {/* 2. Hosting */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              2. Hosting
            </h2>
            <p>
              Unsere Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
              USA gehostet. Beim Besuch unserer Website werden automatisch Informationen
              (z.&nbsp;B. IP-Adresse, Zeitpunkt des Zugriffs, verwendeter Browser) in sogenannten
              Server-Logfiles gespeichert. Diese Daten sind technisch notwendig, um die Website
              korrekt auszuliefern, und werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
              verarbeitet (berechtigtes Interesse an einer stabilen und sicheren Bereitstellung
              der Website).
            </p>
            <p className="mt-2">
              Vercel kann Daten in die USA &uuml;bertragen. Die Daten&uuml;bermittlung erfolgt
              auf Grundlage der EU-Standardvertragsklauseln. Weitere Informationen finden Sie in
              der Datenschutzerkl&auml;rung von Vercel unter{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                vercel.com/legal/privacy-policy
              </a>.
            </p>
          </section>

          {/* 3. Webanalyse */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              3. Webanalyse mit Plausible Analytics
            </h2>
            <p>
              Wir verwenden Plausible Analytics, einen datenschutzfreundlichen Webanalysedienst.
              Plausible setzt keine Cookies, verwendet kein Fingerprinting und erhebt keine
              personenbezogenen Daten. Alle erfassten Daten sind vollst&auml;ndig anonymisiert
              und lassen keinen R&uuml;ckschluss auf einzelne Personen zu. Die Nutzung von
              Plausible erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
              Interesse an der statistischen Analyse des Nutzungsverhaltens zur Verbesserung
              unseres Angebots).
            </p>
            <p className="mt-2">
              Da Plausible keine personenbezogenen Daten erhebt und keine Cookies setzt, ist
              keine Einwilligung gem&auml;&szlig; DSGVO oder ePrivacy-Richtlinie erforderlich.
              Weitere Informationen finden Sie unter{" "}
              <a
                href="https://plausible.io/data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                plausible.io/data-policy
              </a>.
            </p>
          </section>

          {/* 4. Kontaktformular */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              4. Kontaktformular &amp; Kontaktaufnahme
            </h2>
            <p>
              Wenn Sie uns &uuml;ber das Kontaktformular, per E-Mail oder WhatsApp kontaktieren,
              werden die von Ihnen mitgeteilten Daten (z.&nbsp;B. Name, E-Mail-Adresse,
              Telefonnummer, Nachrichteninhalt) zum Zweck der Bearbeitung Ihrer Anfrage
              verarbeitet und gespeichert. Die Verarbeitung erfolgt auf Grundlage von
              Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung bzw. Vertragserf&uuml;llung)
              sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung
              von Anfragen).
            </p>
            <p className="mt-2">
              Ihre Daten werden gel&ouml;scht, sobald die Anfrage abschlie&szlig;end bearbeitet
              wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          {/* 5. Buchungsdaten */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              5. Buchungsdaten &amp; Zahlungsabwicklung
            </h2>
            <p>
              Bei der Buchung einer Tour erheben wir die f&uuml;r die Vertragserf&uuml;llung
              notwendigen Daten (Name, E-Mail-Adresse, Buchungsdetails). Die Verarbeitung
              erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserf&uuml;llung).
            </p>
            <p className="mt-2">
              Die Zahlungsabwicklung erfolgt &uuml;ber Stripe, Inc., 354 Oyster Point Blvd,
              South San Francisco, CA 94080, USA. Im Rahmen der Zahlung werden Ihre
              Zahlungsdaten direkt an Stripe &uuml;bermittelt und dort verarbeitet. Wir haben
              keinen Zugriff auf vollst&auml;ndige Kreditkarten- oder Bankdaten. Die
              Daten&uuml;bermittlung an Stripe erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b
              DSGVO (Vertragserf&uuml;llung). Weitere Informationen finden Sie in der
              Datenschutzerkl&auml;rung von Stripe unter{" "}
              <a
                href="https://stripe.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                stripe.com/de/privacy
              </a>.
            </p>
          </section>

          {/* 6. SSL/TLS */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              6. SSL/TLS-Verschl&uuml;sselung
            </h2>
            <p>
              Diese Website nutzt aus Sicherheitsgr&uuml;nden und zum Schutz der
              &Uuml;bertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschl&uuml;sselung.
              Eine verschl&uuml;sselte Verbindung erkennen Sie daran, dass die Adresszeile des
              Browsers von &bdquo;http://&ldquo; auf &bdquo;https://&ldquo; wechselt und an dem
              Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschl&uuml;sselung
              aktiviert ist, k&ouml;nnen die Daten, die Sie an uns &uuml;bermitteln, nicht von
              Dritten mitgelesen werden.
            </p>
          </section>

          {/* 7. Rechte der Betroffenen */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              7. Rechte der betroffenen Personen
            </h2>
            <p className="mb-3">
              Als betroffene Person haben Sie nach der DSGVO folgende Rechte:
            </p>
            <ul className="space-y-3 list-none">
              <li>
                <strong className="text-dark">Auskunftsrecht (Art. 15 DSGVO):</strong>{" "}
                Sie haben das Recht, Auskunft &uuml;ber die von uns verarbeiteten
                personenbezogenen Daten zu erhalten.
              </li>
              <li>
                <strong className="text-dark">Recht auf Berichtigung (Art. 16 DSGVO):</strong>{" "}
                Sie k&ouml;nnen die Berichtigung unrichtiger oder die Vervollst&auml;ndigung
                unvollst&auml;ndiger Daten verlangen.
              </li>
              <li>
                <strong className="text-dark">Recht auf L&ouml;schung (Art. 17 DSGVO):</strong>{" "}
                Sie k&ouml;nnen die L&ouml;schung Ihrer personenbezogenen Daten verlangen,
                sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </li>
              <li>
                <strong className="text-dark">Recht auf Einschr&auml;nkung der Verarbeitung (Art. 18 DSGVO):</strong>{" "}
                Sie k&ouml;nnen die Einschr&auml;nkung der Verarbeitung Ihrer Daten verlangen.
              </li>
              <li>
                <strong className="text-dark">Recht auf Daten&uuml;bertragbarkeit (Art. 20 DSGVO):</strong>{" "}
                Sie haben das Recht, die Sie betreffenden Daten in einem g&auml;ngigen,
                maschinenlesbaren Format zu erhalten oder an einen anderen Verantwortlichen
                &uuml;bermitteln zu lassen.
              </li>
              <li>
                <strong className="text-dark">Widerspruchsrecht (Art. 21 DSGVO):</strong>{" "}
                Sie k&ouml;nnen jederzeit gegen die Verarbeitung Ihrer personenbezogenen Daten
                Widerspruch einlegen, sofern die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO
                (berechtigtes Interesse) beruht.
              </li>
            </ul>
            <p className="mt-3">
              Zur Aus&uuml;bung Ihrer Rechte k&ouml;nnen Sie sich jederzeit an uns wenden unter:{" "}
              <a href="mailto:info@helgolandbahn.de" className="text-primary hover:underline">
                info@helgolandbahn.de
              </a>
            </p>
          </section>

          {/* 8. Beschwerderecht */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              8. Beschwerderecht bei der Aufsichtsbeh&ouml;rde
            </h2>
            <p>
              Unbeschadet eines anderweitigen verwaltungsrechtlichen oder gerichtlichen
              Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbeh&ouml;rde
              zu, wenn Sie der Ansicht sind, dass die Verarbeitung der Sie betreffenden
              personenbezogenen Daten gegen die DSGVO verst&ouml;&szlig;t. Die f&uuml;r uns
              zust&auml;ndige Aufsichtsbeh&ouml;rde ist:
            </p>
            <p className="mt-2">
              Unabh&auml;ngiges Landeszentrum f&uuml;r Datenschutz Schleswig-Holstein (ULD)<br />
              Holstenstra&szlig;e 98<br />
              24103 Kiel<br />
              <a
                href="https://www.datenschutzzentrum.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                www.datenschutzzentrum.de
              </a>
            </p>
          </section>

          {/* 9. Cookies */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              9. Cookies
            </h2>
            <p>
              Diese Website verwendet <strong className="text-dark">keine Cookies</strong>.
              Wir setzen weder eigene noch Drittanbieter-Cookies ein. Es findet kein Tracking
              mittels Cookies, Fingerprinting oder vergleichbarer Technologien statt.
              Eine Einwilligung gem&auml;&szlig; Art. 7 DSGVO i.&nbsp;V.&nbsp;m.
              &sect;&nbsp;25 TDDDG (ehemals TTDSG) ist daher nicht erforderlich.
            </p>
          </section>

          {/* 10. Datenbank */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              10. Datenbank &amp; Datenspeicherung (Supabase)
            </h2>
            <p>
              F&uuml;r die Speicherung von Buchungsdaten, Tourverf&uuml;gbarkeiten und
              anonymisierten Chat-Zusammenfassungen nutzen wir Supabase Inc., 970 Toa Payoh
              North #07-04, Singapore 318992. Supabase betreibt die Datenbank auf Basis von
              PostgreSQL in EU-Rechenzentren (Frankfurt/Main).
            </p>
            <p className="mt-2">
              <strong className="text-dark">Gespeicherte Daten:</strong>
            </p>
            <ul className="mt-1 space-y-1 list-disc pl-5">
              <li>Buchungsdaten: Name, E-Mail, Telefon (optional), Buchungsdetails, Zahlungsstatus</li>
              <li>Tour- und Fahrplandaten (keine personenbezogenen Daten)</li>
              <li>Anonymisierte Chat-Zusammenfassungen (siehe Abschnitt 11)</li>
            </ul>
            <p className="mt-2">
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserf&uuml;llung) f&uuml;r Buchungsdaten und Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse) f&uuml;r anonymisierte Analysen. Buchungsdaten werden
              nach Ablauf der gesetzlichen Aufbewahrungsfristen (6 bzw. 10 Jahre gem&auml;&szlig;
              HGB/AO) gel&ouml;scht. Weitere Informationen:{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                supabase.com/privacy
              </a>.
            </p>
          </section>

          {/* 11. KI-Chatbot */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              11. KI-Chatbot
            </h2>
            <p>
              Auf unserer Website bieten wir einen KI-gest&uuml;tzten Chatbot an.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              a) Zweck
            </h3>
            <p>
              Beantwortung von Fragen zu Touren, Preisen, Abfahrtszeiten und allgemeinen
              Informationen &uuml;ber Helgoland.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              b) Rechtsgrundlage
            </h3>
            <p>
              Einwilligung (Art. 6 Abs. 1 lit. a DSGVO) via Consent-Screen vor Chatbeginn.
              F&uuml;r die Speicherung anonymisierter Themenzusammenfassungen: berechtigtes Interesse
              (Art. 6 Abs. 1 lit. f DSGVO) an der Analyse und Verbesserung unseres Kundenservices.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              c) Verarbeitete Daten
            </h3>
            <p>
              Ihre Texteingaben im Chat.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              d) Empf&auml;nger &amp; Drittlandtransfer
            </h3>
            <p>
              Ihre Chat-Nachrichten werden zur Verarbeitung an <strong className="text-dark">OpenAI, L.L.C.</strong>,
              3180 18th Street, San Francisco, CA 94110, USA &uuml;bermittelt. Es wird das Modell
              &bdquo;GPT-5.4-mini&ldquo; verwendet. Die Daten&uuml;bermittlung erfolgt auf Basis von{" "}
              <strong className="text-dark">EU-Standardvertragsklauseln</strong> (Art. 46 Abs. 2 lit. c DSGVO)
              und dem <strong className="text-dark">Data Processing Agreement</strong> von OpenAI.
              OpenAI nutzt API-Daten{" "}
              <strong className="text-dark">nicht f&uuml;r Modelltraining</strong>.
              Zus&auml;tzlich wird der Parameter <code className="bg-gray-100 px-1 rounded text-xs">store:&nbsp;false</code> gesetzt,
              sodass OpenAI die &uuml;bermittelten Daten nicht speichert.
            </p>
            <p className="mt-2">
              Weitere Informationen:{" "}
              <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                openai.com/policies/privacy-policy
              </a>
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              e) Speicherdauer
            </h3>
            <p>
              Ihre Chatnachrichten werden <strong className="text-dark">nicht persistent gespeichert</strong>.
              Sobald Sie den Chat schlie&szlig;en oder die Seite verlassen, werden alle Nachrichten
              im Browser unwiderruflich gel&ouml;scht. Auf unseren Servern werden keine vollst&auml;ndigen
              Konversationen vorgehalten.
            </p>
            <p className="mt-2">
              Lediglich <strong className="text-dark">anonymisierte Themenzusammenfassungen</strong>{" "}
              (z.&nbsp;B. &bdquo;Frage zu Hunden&ldquo;) werden zur Serviceverbesserung erfasst.
              Diese enthalten:
            </p>
            <ul className="mt-1 space-y-1 list-disc pl-5">
              <li>Das Thema der Anfrage (max. 2&ndash;3 S&auml;tze)</li>
              <li>Thematische Kategorien (z.&nbsp;B. &bdquo;preise&ldquo;, &bdquo;hunde&ldquo;, &bdquo;stornierung&ldquo;)</li>
              <li>Einen Erfolgsstatus (ob die Anfrage beantwortet werden konnte)</li>
              <li>Die Anzahl der Nachrichten</li>
            </ul>
            <p className="mt-2">
              <strong className="text-dark">Keine personenbezogenen Daten:</strong> Die
              Zusammenfassungen enthalten keine Namen, E-Mail-Adressen, Telefonnummern,
              IP-Adressen oder sonstige personenbezogene Daten.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              f) Widerruf
            </h3>
            <p>
              Sie k&ouml;nnen Ihre Einwilligung jederzeit widerrufen, indem Sie den Chat
              schlie&szlig;en und die Seite neu laden. Die Einwilligung wird nur f&uuml;r die
              Dauer der Browser-Sitzung gespeichert (sessionStorage) und verf&auml;llt automatisch.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              g) KI-Kennzeichnung (EU-KI-Verordnung)
            </h3>
            <p>
              Alle Antworten des Chatbots sind als &bdquo;KI-generierte Antwort&ldquo;
              gekennzeichnet. Dies erfolgt gem&auml;&szlig; den Transparenzanforderungen
              der <strong className="text-dark">EU-KI-Verordnung (KI-VO / AI Act)</strong>.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              h) Keine Erhebung personenbezogener Daten
            </h3>
            <p>
              Der Chatbot erfragt und speichert keine personenbezogenen Daten. Bitte geben Sie
              im Chat keine pers&ouml;nlichen Informationen wie Namen, Adressen, Telefonnummern
              oder Zahlungsdaten ein. Sollten Sie versehentlich personenbezogene Daten im Chat
              eingeben, werden diese mit dem Schlie&szlig;en des Chats gel&ouml;scht und
              erscheinen nicht in der anonymisierten Zusammenfassung.
            </p>

            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">
              i) Missbrauchsschutz
            </h3>
            <p>
              Zum Schutz vor Missbrauch werden folgende Ma&szlig;nahmen eingesetzt:
            </p>
            <ul className="mt-1 space-y-1 list-disc pl-5">
              <li>Rate-Limiting: Begrenzung auf 20 Nachrichten pro Minute pro IP-Adresse</li>
              <li>Eingabebegrenzung: Nachrichten sind auf 500 Zeichen limitiert</li>
              <li>Konversationsverlauf: Nur die letzten 10 Nachrichten werden zur Verarbeitung gesendet</li>
              <li>Prompt-Injection-Erkennung: Automatische Erkennung und Abwehr von Manipulationsversuchen (25+ Regex-Filter)</li>
            </ul>
            <p className="mt-2">
              Dabei wird die IP-Adresse tempor&auml;r im Arbeitsspeicher verarbeitet (max. 1 Minute)
              und nicht dauerhaft gespeichert. Die Verarbeitung erfolgt auf Grundlage von
              Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Schutz vor Missbrauch).
            </p>
          </section>

          {/* 12. Aufbewahrungsfristen */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              12. Aufbewahrungsfristen
            </h2>
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie es f&uuml;r den jeweiligen
              Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen:
            </p>
            <ul className="mt-2 space-y-2 list-none">
              <li>
                <strong className="text-dark">Buchungsdaten:</strong> 10 Jahre (gesetzliche
                Aufbewahrungspflicht gem. &sect;&nbsp;147 AO, &sect;&nbsp;257 HGB)
              </li>
              <li>
                <strong className="text-dark">Kontaktanfragen:</strong> Bis zur abschlie&szlig;enden
                Bearbeitung, danach L&ouml;schung
              </li>
              <li>
                <strong className="text-dark">Chat-Zusammenfassungen:</strong> 12 Monate
                (anonymisiert, keine personenbezogenen Daten)
              </li>
              <li>
                <strong className="text-dark">Server-Logfiles:</strong> 30 Tage (Vercel)
              </li>
            </ul>
          </section>

          {/* 13. Änderung */}
          <section>
            <h2 className="text-xl font-semibold text-dark mb-3">
              13. &Auml;nderung der Datenschutzerkl&auml;rung
            </h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerkl&auml;rung bei Bedarf anzupassen,
              um sie an ge&auml;nderte Rechtslagen oder &Auml;nderungen unseres Angebots
              anzupassen. Die jeweils aktuelle Version finden Sie stets auf dieser Seite.
            </p>
            <p className="mt-2 text-dark/50 text-sm">
              Stand: April 2026
            </p>
          </section>
        </div>
      </div>
    </main>
      <Footer />
    </>
  );
}
