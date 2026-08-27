"use client";

import PublicPage from "@/components/public/PublicPage";
import { useLanguage } from "@/hooks/useLanguage";
import { VIDEO_DEMO_URL } from "@/lib/constants";
import { ArrowRight, MapPinned, Satellite, BrainCircuit, Bell, MessageCircle, PlayCircle } from "lucide-react";

const icons = [MapPinned, Satellite, BrainCircuit, Bell, MessageCircle];

export default function HowItWorks() {
  const { t } = useLanguage();
  return <PublicPage title={t.howTitle} text={t.howText} image="/images/hero-spraying.jpg">
    <a href={VIDEO_DEMO_URL} target="_blank" rel="noreferrer" className="btn-primary mt-7 w-full sm:w-auto"><PlayCircle size={19}/>{t.watchDemo}<ArrowRight size={18}/></a>

    <div className="mt-10 space-y-5">
      {t.howSteps.map(([heading, description], index) => {
        const Icon = icons[index];
        const reverse = index % 2 === 1;
        return <article key={heading} className="grid overflow-hidden rounded-2xl border border-fasai-100 bg-white shadow-sm md:grid-cols-2">
          <div className={`${reverse ? "md:order-2" : ""} min-h-[220px] bg-fasai-50`}>
            <img src={index % 2 === 0 ? "/images/hero-planting.jpg" : "/images/hero-harvest.jpg"} alt={heading} className="h-full min-h-[220px] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fasai-100 text-fasai-700"><Icon size={23}/></div>
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-fasai-600">{index + 1}</p>
            <h2 className="mt-1 text-xl font-black text-fasai-900">{heading}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
        </article>;
      })}
    </div>
  </PublicPage>;
}
