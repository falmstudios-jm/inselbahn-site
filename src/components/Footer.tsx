"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 px-5 md:px-10 lg:px-20 py-6 mb-[60px]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-dark/40 text-sm">
          &copy; 2026 Helgoländer Dienstleistungs GmbH
        </p>
        <div className="flex items-center gap-1 sm:gap-4 flex-wrap justify-center sm:justify-end">
          <a href="/gutschein" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            Gutscheine
          </a>
          <span className="text-dark/20 hidden sm:inline">&middot;</span>
          <a href="/booking/cancel" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            Stornierung
          </a>
          <span className="text-dark/20 hidden sm:inline">&middot;</span>
          <a href="/booking/invoice" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            Rechnung
          </a>
          <span className="text-dark/20 hidden sm:inline">&middot;</span>
          <a href="/agb" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            AGB
          </a>
          <span className="text-dark/20 hidden sm:inline">&middot;</span>
          <a href="/impressum" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            Impressum
          </a>
          <span className="text-dark/20 hidden sm:inline">&middot;</span>
          <a href="/datenschutz" className="text-dark/40 hover:text-dark text-sm transition-colors py-2 px-1.5 sm:px-0">
            Datenschutz
          </a>
        </div>
      </div>
    </footer>
  );
}
