"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return "\u2600\uFE0F";
  if (code <= 3) return "\u26C5";
  if (code <= 48) return "\u2601\uFE0F";
  if (code <= 57) return "\uD83C\uDF27\uFE0F";
  if (code <= 67) return "\uD83C\uDF27\uFE0F";
  if (code <= 77) return "\u2744\uFE0F";
  if (code <= 82) return "\uD83C\uDF27\uFE0F";
  if (code <= 86) return "\uD83C\uDF28\uFE0F";
  if (code <= 99) return "\u26A1";
  return "\u2601\uFE0F";
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Klar";
  if (code <= 3) return "Teilweise bewölkt";
  if (code <= 48) return "Bewölkt";
  if (code <= 67) return "Regen";
  if (code <= 77) return "Schnee";
  if (code <= 82) return "Schauer";
  if (code <= 86) return "Schnee";
  if (code <= 99) return "Gewitter";
  return "Bewölkt";
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=54.18&longitude=7.88&current=temperature_2m,wind_speed_10m,weather_code&timezone=Europe/Berlin"
        );
        const data = await res.json();
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          weatherCode: data.current.weather_code,
        });
      } catch {
        /* silently fail */
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isWarning =
    weather && (weather.windSpeed > 60 || weather.weatherCode >= 95);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 w-[180px] animate-pulse">
        <div className="h-4 bg-dark/10 rounded w-20 mb-2" />
        <div className="h-6 bg-dark/10 rounded w-16 mb-1" />
        <div className="h-3 bg-dark/10 rounded w-24" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div
      className={`rounded-xl px-5 py-3 inline-block ${
        isWarning
          ? "bg-red-50 border border-red-200"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      <p className="text-xs text-dark/50 mb-1">
        Helgoland jetzt
      </p>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl">{getWeatherEmoji(weather.weatherCode)}</span>
        <span className="text-xl font-bold text-dark">
          {weather.temperature}&deg;C
        </span>
      </div>
      <p className="text-xs text-dark/60">
        {getWeatherLabel(weather.weatherCode)} &middot; Wind{" "}
        {weather.windSpeed} km/h
      </p>
      {isWarning && (
        <p className="text-xs text-red-600 font-medium mt-1">
          Sturmwarnung &mdash; Fahrten ggf. eingeschränkt
        </p>
      )}
    </div>
  );
}
