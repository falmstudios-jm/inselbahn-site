"use client";

import { useState, useEffect } from "react";

const departureTimes = [
  { hour: 11, minute: 0 },
  { hour: 12, minute: 15 },
  { hour: 13, minute: 15 },
  { hour: 13, minute: 30 },
  { hour: 14, minute: 0 },
  { hour: 14, minute: 30 },
  { hour: 15, minute: 0 },
  { hour: 16, minute: 0 },
];

function getNextDeparture(): { label: string; seconds: number } | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const dep of departureTimes) {
    const depMinutes = dep.hour * 60 + dep.minute;
    if (depMinutes > currentMinutes) {
      const diffMs =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          dep.hour,
          dep.minute,
          0
        ).getTime() - now.getTime();
      return {
        label: `${dep.hour.toString().padStart(2, "0")}:${dep.minute.toString().padStart(2, "0")}`,
        seconds: Math.max(0, Math.floor(diffMs / 1000)),
      };
    }
  }

  return null;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function CountdownTimer() {
  const [countdown, setCountdown] = useState<{
    label: string;
    seconds: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCountdown(getNextDeparture());

    const interval = setInterval(() => {
      setCountdown(getNextDeparture());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 text-center inline-block">
      {countdown ? (
        <>
          <p className="text-xs text-dark/50 mb-1">
            Naechste Abfahrt um {countdown.label}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-dark tabular-nums">
            <span className="animate-countdown-pulse inline-block">
              in {formatCountdown(countdown.seconds)}
            </span>
          </p>
        </>
      ) : (
        <>
          <p className="text-xs text-dark/50 mb-1">
            Heute keine weiteren Abfahrten
          </p>
          <p className="text-base font-medium text-dark">
            Erste Abfahrt morgen um 11:00 Uhr
          </p>
        </>
      )}
    </div>
  );
}
