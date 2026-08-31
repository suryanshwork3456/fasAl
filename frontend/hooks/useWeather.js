"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

export default function useWeather() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [noField, setNoField] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        setIsLoading(true);
        setError(null);
        setNoField(false);

        const json = await authFetch("/api/v1/weather/first-field");
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Something went wrong.";
          // backend sends a 404 with a "no field" style detail message when none exists
          if (message.toLowerCase().includes("field")) {
            setNoField(true);
          } else {
            setError(message);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  return { data, isLoading, error, noField };
}