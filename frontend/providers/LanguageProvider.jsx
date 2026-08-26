"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy } from "@/lib/constants";

const LanguageContext = createContext(null);

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिंदी", short: "हि" },
  { code: "mr", label: "मराठी", short: "मरा" }
];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("fasai_lang");
    if (saved === "en" || saved === "hi" || saved === "mr") setLangState(saved);
  }, []);

  const setLanguage = (code) => {
    if (!copy[code]) return;
    localStorage.setItem("fasai_lang", code);
    setLangState(code);
  };

  // kept for any older call sites — cycles EN -> HI -> MR -> EN
  const toggleLanguage = () => {
    const order = LANGUAGES.map(l => l.code);
    const next = order[(order.indexOf(lang) + 1) % order.length];
    setLanguage(next);
  };

  const value = useMemo(
    () => ({ lang, t: copy[lang], setLanguage, toggleLanguage, languages: LANGUAGES }),
    [lang]
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
