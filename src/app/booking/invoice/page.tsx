"use client";

import { useState } from "react";
import Link from "next/link";

export default function InvoicePage() {
  const [bookingReference, setBookingReference] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invoice data form fields
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [vatId, setVatId] = useState("");
  const [country, setCountry] = useState("Deutschland");

  const countryOptions = [
    "Deutschland", "Österreich", "Schweiz", "Niederlande", "Belgien",
    "Dänemark", "Polen", "Frankreich", "Luxemburg", "Tschechien",
    "Vereinigtes Königreich", "Schweden", "Norwegen", "Italien", "Spanien",
  ];

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_reference: bookingReference.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needs_invoice_data) {
          setShowInvoiceForm(true);
          setError(null);
        } else {
          setError(data.error || "Ein Fehler ist aufgetreten.");
        }
        setLoading(false);
        return;
      }

      // Download the PDF
      if (data.invoice_url) {
        window.open(data.invoice_url, "_blank");
        setSuccess("Ihre Rechnung wird heruntergeladen.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    }
    setLoading(false);
  }

  async function handleSaveAndDownload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_reference: bookingReference.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          invoice_data: {
            company_name: companyName.trim(),
            street: street.trim(),
            postal_code: postalCode.trim(),
            city: city.trim(),
            country: country,
            vat_id: vatId.trim() || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ein Fehler ist aufgetreten.");
        setLoading(false);
        return;
      }

      if (data.invoice_url) {
        window.open(data.invoice_url, "_blank");
        setSuccess("Rechnungsdaten gespeichert. Ihre Rechnung wird heruntergeladen.");
        setShowInvoiceForm(false);
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    }
    setLoading(false);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/20 focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white py-6 px-5">
        <div className="max-w-xl mx-auto">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            &larr; Zurück zur Startseite
          </Link>
          <h1 className="text-2xl font-bold mt-2">Rechnung herunterladen</h1>
          <p className="text-white/70 text-sm mt-1">
            Laden Sie Ihre Rechnung herunter oder ergänzen Sie Ihre Rechnungsdaten.
          </p>
        </div>
      </header>

      <main className="flex-1 px-5 py-10">
        <div className="max-w-xl mx-auto">
          {/* Lookup form */}
          <form onSubmit={handleLookup} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Buchung finden
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="ref" className="block text-sm font-medium text-gray-700 mb-1">
                  Buchungsnummer
                </label>
                <input
                  id="ref"
                  type="text"
                  className={inputClass}
                  placeholder="z.B. IB-2026-ABCD"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail-Adresse
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputClass}
                  placeholder="ihre@email.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {!showInvoiceForm && (
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-[#1a3a5c] text-white font-semibold py-3 rounded-lg hover:bg-[#15304d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Wird geladen..." : "Rechnung herunterladen"}
              </button>
            )}
          </form>

          {/* Invoice data form */}
          {showInvoiceForm && (
            <form onSubmit={handleSaveAndDownload} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Rechnungsdaten ergänzen
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Für diese Buchung liegen noch keine Rechnungsdaten vor. Bitte ergänzen Sie die Angaben.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Firma / Name
                  </label>
                  <input
                    id="company"
                    type="text"
                    className={inputClass}
                    placeholder="Musterfirma GmbH"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Straße und Hausnummer
                  </label>
                  <input
                    id="street"
                    type="text"
                    className={inputClass}
                    placeholder="Musterstraße 1"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="plz" className="block text-sm font-medium text-gray-700 mb-1">
                      PLZ
                    </label>
                    <input
                      id="plz"
                      type="text"
                      className={inputClass}
                      placeholder="12345"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ort
                    </label>
                    <input
                      id="city"
                      type="text"
                      className={inputClass}
                      placeholder="Musterstadt"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Land
                  </label>
                  <select
                    id="country"
                    className={inputClass}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {countryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="vatid" className="block text-sm font-medium text-gray-700 mb-1">
                    USt-IdNr. <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="vatid"
                    type="text"
                    className={inputClass}
                    placeholder="DE123456789"
                    value={vatId}
                    onChange={(e) => setVatId(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-[#1a3a5c] text-white font-semibold py-3 rounded-lg hover:bg-[#15304d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Wird gespeichert..."
                  : "Rechnungsdaten speichern & Rechnung herunterladen"}
              </button>
            </form>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          {/* Help */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Hinweis:</strong> Ihre Buchungsnummer finden Sie in Ihrer Bestätigungs-E-Mail.
              Sie hat das Format IB-2026-XXXX.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-5 py-6 text-center">
        <p className="text-gray-400 text-sm">
          &copy; 2026 Helgoländer Dienstleistungs GmbH
        </p>
      </footer>
    </div>
  );
}
