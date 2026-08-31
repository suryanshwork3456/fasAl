"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useField(fieldId) {
  const [field, setField] = useState(null);
  const [ndvi, setNdvi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fieldId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [fieldRes, ndviRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/field-form/${fieldId}`),
          fetch(`${API_BASE}/api/v1/fields/${fieldId}/ndvi`),
        ]);

        if (!fieldRes.ok) throw new Error(`Field fetch failed: ${fieldRes.status}`);
        if (!cancelled) setField(await fieldRes.json());

        // NDVI failing shouldn't block showing the field itself —
        // e.g. a brand-new field with no boundary yet returns 422.
        if (ndviRes.ok) {
          if (!cancelled) setNdvi(await ndviRes.json());
        } else {
          if (!cancelled) setNdvi(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [fieldId]);

  return { field, ndvi, loading, error };
}