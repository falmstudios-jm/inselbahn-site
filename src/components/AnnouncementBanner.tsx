"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface Announcement {
  id: string;
  message: string;
  type: "info" | "warning" | "cancellation";
  is_active: boolean;
  active_from: string | null;
  active_until: string | null;
  created_at: string;
}

const TYPE_STYLES: Record<string, string> = {
  info: "bg-green text-white",
  warning: "bg-amber-500 text-white",
  cancellation: "bg-red-600 text-white",
};

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function fetchAnnouncement() {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_active", true)
        .or(`active_until.is.null,active_until.gt.${now}`)
        .or(`active_from.is.null,active_from.lte.${now}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return;

      // Check if this specific announcement was already dismissed this session
      const dismissedId = sessionStorage.getItem("announcement-dismissed-id");
      if (dismissedId === data.id) return;

      setAnnouncement(data);
      setVisible(true);
    }

    fetchAnnouncement();
  }, []);

  function dismiss() {
    setVisible(false);
    if (announcement) {
      sessionStorage.setItem("announcement-dismissed-id", announcement.id);
    }
  }

  if (!visible || !announcement) return null;

  const bgClass = TYPE_STYLES[announcement.type] || TYPE_STYLES.info;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 ${bgClass} animate-slide-up`}>
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex items-center justify-center gap-3 text-sm md:text-base relative">
        <div className="text-center pr-8">
          <p className="font-bold">{announcement.message}</p>
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
