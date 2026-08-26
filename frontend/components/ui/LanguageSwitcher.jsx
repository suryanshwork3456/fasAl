"use client";
import { useEffect, useRef, useState } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Shared language dropdown — used in the desktop navbar, the mobile top bar,
 * the mobile drawer footer, and the auth screens. Supports English, Hindi
 * and Marathi; selecting an option re-renders the whole app in that language
 * via LanguageProvider.
 */
export default function LanguageSwitcher({ variant = "pill", className = "" }) {
  const { lang, languages, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const pick = (code) => { setLanguage(code); setOpen(false); };

  const triggerClass =
    variant === "block"
      ? "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 font-bold text-slate-800"
      : "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-800 hover:border-fasai-500";

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className={triggerClass}
      >
        <Languages size={16} />
        <span>{current.short}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {languages.map(l => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                onClick={() => pick(l.code)}
                className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-fasai-50 ${l.code === lang ? "text-fasai-700" : "text-slate-700"}`}
              >
                {l.label}
                {l.code === lang && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
