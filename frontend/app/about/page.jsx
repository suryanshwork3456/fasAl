"use client";

import PublicPage from "@/components/public/PublicPage";
import { useLanguage } from "@/hooks/useLanguage";
import { Satellite, CloudSun, Sprout, ShieldCheck } from "lucide-react";

const icons = [Satellite, CloudSun, Sprout, ShieldCheck];

export default function About() {
  const { t } = useLanguage();
  return <PublicPage title={t.aboutTitle} text={t.aboutText} image="/images/hero-monitoring.jpg">
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {t.aboutPoints.map(([heading, description], i) => { const Icon = icons[i]; return <div key={heading} className="rounded-2xl border border-fasai-100 bg-white/95 p-5 shadow-sm"><Icon className="text-fasai-600" size={26}/><h2 className="mt-3 font-black text-fasai-900">{heading}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>; })}
    </div>
    <div className="mt-8 overflow-hidden rounded-2xl border border-fasai-100 bg-white shadow-sm">
      <div className="aspect-[16/8] w-full"><img src="/images/hero-harvest.jpg" alt={t.aboutClosingTitle} className="h-full w-full object-cover" /></div>
      <div className="p-5 sm:p-6"><h2 className="text-xl font-black text-fasai-900">{t.aboutClosingTitle}</h2><p className="mt-2 leading-7 text-slate-600">{t.aboutClosingText}</p></div>
    </div>
  </PublicPage>;
}
