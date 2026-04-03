"use client";

import { useState, useEffect } from "react";

interface DepartureSlot {
  departure_time: string;
  tour_name: string;
}

function parseTime(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(":").map(Number);
  return { hour: h, minute: m };
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CountdownTimer() {
  const [departures, setDepartures] = useState<DepartureSlot[]>([]);
  const [nextDep, setNextDep] = useState<{ label: string; seconds: number } | null>(null);
  const [earliestTomorrow, setEarliestTomorrow] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch departures from Supabase via availability API
  useEffect(() => {
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/availability?date=${today}`)
      .then((r) => r.json())
      .then((slots: { departure_time: string; tour_name: string }[]) => {
        if (Array.isArray(slots)) {
          setDepartures(slots);
          // Find earliest for "tomorrow" fallback
          if (slots.length > 0) {
            const times = slots.map((s) => s.departure_time).sort();
            setEarliestTomorrow(times[0]?.slice(0, 5) || "10:00");
          }
        }
      })
      .catch(() => {
        // Fallback — don't show countdown
      });
  }, []);

  // Update countdown every second
  useEffect(() => {
    if (departures.length === 0) return;

    function calcNext() {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const dep of departures) {
        const { hour, minute } = parseTime(dep.departure_time);
        const depMinutes = hour * 60 + minute;
        if (depMinutes > currentMinutes) {
          const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
          const diffMs = target.getTime() - now.getTime();
          return { label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`, seconds: Math.max(0, Math.floor(diffMs / 1000)) };
        }
      }
      return null;
    }

    setNextDep(calcNext());
    const interval = setInterval(() => setNextDep(calcNext()), 1000);
    return () => clearInterval(interval);
  }, [departures]);

  if (!mounted) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center inline-block">
      {nextDep ? (
        <>
          <p className="text-xs text-dark/50 mb-1">Nächste Abfahrt um {nextDep.label}</p>
          <p className="text-2xl md:text-3xl font-bold text-dark tabular-nums">
            <span className="animate-countdown-pulse inline-block">in {formatCountdown(nextDep.seconds)}</span>
          </p>
        </>
      ) : (
        <>
          <p className="text-xs text-dark/50 mb-1">Heute keine weiteren Abfahrten</p>
          <p className="text-base font-medium text-dark">
            Erste Abfahrt morgen um {earliestTomorrow || "10:00"} Uhr
          </p>
        </>
      )}
    </div>
  );
}
