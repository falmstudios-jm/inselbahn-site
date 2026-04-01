"use client";

import { useState, FormEvent } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [showGdpr, setShowGdpr] = useState(false);
  const [toast, setToast] = useState(false);

  function handleInputStart() {
    if (!showGdpr) setShowGdpr(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!gdprConsent) return;

    console.log("Contact form submitted:", { name, email, message });
    setToast(true);
    setName("");
    setEmail("");
    setMessage("");
    setGdprConsent(false);
    setShowGdpr(false);

    setTimeout(() => setToast(false), 5000);
  }

  return (
    <section
      id="kontakt"
      className="px-5 md:px-10 lg:px-20 py-20 md:py-28 bg-surface relative"
    >
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-success text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Vielen Dank! Wir melden uns schnellstmoeglich bei Ihnen.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <h2 className="text-[28px] md:text-[40px] font-bold text-dark mb-2 text-center">
          Kontakt
        </h2>
        <p className="text-dark/60 text-center mb-12">
          Fuer Gruppenbuchungen und Sonderwuensche
        </p>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={handleInputStart}
                required
                placeholder="Ihr Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleInputStart}
                required
                placeholder="ihre@email.de"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Nachricht
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={handleInputStart}
                required
                rows={5}
                placeholder="Ihre Nachricht..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-dark focus:outline-none transition-colors bg-white resize-none"
              />
            </div>

            {/* GDPR consent */}
            <div
              className="overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: showGdpr ? "100px" : "0px",
                opacity: showGdpr ? 1 : 0,
              }}
            >
              <label className="flex items-start gap-3 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-dark"
                />
                <span className="text-sm text-dark/60">
                  Ich stimme der Verarbeitung meiner Daten gemaess der{" "}
                  <a href="#" className="underline text-dark">
                    Datenschutzerklaerung
                  </a>{" "}
                  zu.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!gdprConsent}
              className={`w-full py-3.5 rounded-full font-semibold transition-colors ${
                gdprConsent
                  ? "bg-dark text-white hover:bg-dark/85"
                  : "bg-dark/10 text-dark/30 cursor-not-allowed"
              }`}
            >
              Nachricht senden
            </button>
          </form>

          {/* WhatsApp card */}
          <div className="flex flex-col justify-center">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-bold text-dark">
                    Schneller geht&apos;s per WhatsApp
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/491604170905"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#25D366]/90 transition-colors"
              >
                +49 160 4170905
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
