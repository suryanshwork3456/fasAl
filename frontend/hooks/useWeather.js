"use client";
import { useEffect, useState } from "react";

export default function useWeather() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
    try {
  setIsLoading(true);
  setError(null);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/weather/first-field`;
  console.log("Fetching weather from:", url);

  const res = await fetch(url);
  console.log("Response status:", res.status, res.statusText);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.log("Error response body:", body);
    throw new Error(body.detail || "Failed to load weather data.");
  }
  const json = await res.json();
  console.log("Weather data received:", json);
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isLoading, error };
}