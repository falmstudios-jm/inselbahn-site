"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/lib/plausible";

const navItems = [
  { label: "Touren", href: "/#touren" },
  { label: "Fahrplan", href: "/#fahrplan" },
  { label: "Gutscheine", href: "/gutschein" },
  { label: "Kontakt", href: "/#kontakt" },
];

const entdeckenItems = [
  { label: "Helgoland Tour", href: "/helgoland-tour" },
  { label: "Sehenswürdigkeiten", href: "/helgoland-sehenswuerdigkeiten" },
  { label: "Die Lange Anna", href: "/lange-anna" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 bg-white ${
        scrolled ? "shadow-md py-3" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-20 flex items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          {/* Use plain <img> — the SVG embeds a raster pattern which next/image's
              optimizer can mangle on some Vercel deploys (rendered as black rect). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/inselbahn-logo.svg"
            alt="Inselbahn Helgoland"
            width={180}
            height={44}
            style={{ width: 180, height: 44 }}
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => trackEvent("Header Nav Clicked", { link: item.label })}
              className="text-dark/70 hover:text-dark text-sm font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* Entdecken dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 text-dark/70 hover:text-dark text-sm font-medium transition-colors"
            >
              Entdecken
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-fade-in-up">
                {entdeckenItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setDropdownOpen(false); trackEvent("Header Nav Clicked", { link: item.label }); }}
                    className="block px-4 py-2.5 text-sm text-dark/70 hover:text-dark hover:bg-gray-50 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/#buchung"
            className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            Buchen
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-3 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-dark"
          aria-label="Menü öffnen"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1 animate-fade-in-up">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => { setMobileOpen(false); trackEvent("Header Nav Clicked", { link: item.label }); }}
              className="block py-3 min-h-[44px] flex items-center text-dark/70 hover:text-dark text-base font-medium transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <p className="text-xs text-dark/40 uppercase tracking-wide font-semibold py-1.5">
              Entdecken
            </p>
            {entdeckenItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => { setMobileOpen(false); trackEvent("Header Nav Clicked", { link: item.label }); }}
                className="block py-3 min-h-[44px] flex items-center text-dark/70 hover:text-dark text-base font-medium transition-colors pl-3"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Link
            href="/#buchung"
            onClick={() => setMobileOpen(false)}
            className="block py-3.5 mt-2 bg-primary text-white text-center text-base font-semibold rounded-xl hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Jetzt buchen
          </Link>
        </div>
      )}
    </header>
  );
}
