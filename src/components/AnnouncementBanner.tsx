"use client";

import { useState, useEffect } from "react";

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-green text-white animate-slide-up">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex items-center justify-center gap-3 text-sm md:text-base relative">
        <div className="text-center pr-8">
          <p className="font-bold">
            Nun deutlich mehr Premium-Touren mit bis zu 18 Personen!
          </p>
          <p className="text-white/90 text-sm mt-0.5">
            Unterland-Tour (13:30 und 14:30) &mdash; Premium-Tour (11:00 - (12:15) - 13:15 - 14:00 - 15:00 - 16:00 Uhr)
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Schließen"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
