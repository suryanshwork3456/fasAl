"use client";

import Link from "next/link";
import { ArrowRight, Satellite, CloudSun, Sprout } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function InfoSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-fasai-50 border-y border-fasai-100">
      <div className="container-fasai grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2">
        <div>
          <p className="font-bold text-fasai-700">{t.fieldIntelligence}</p>
          <h2 className="section-title mt-2">{t.monitoring}</h2>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">{t.monitoringText}</p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              [Satellite, t.satellite],
              [CloudSun, t.weather],
              [Sprout, t.cropHealth],
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-xl border border-fasai-100 bg-white p-3">
                <Icon className="text-fasai-600" size={20} />
                <span className="mt-2 block text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/register" className="btn-primary mt-7">
            {t.registerNow}
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] shadow-2xl sm:min-h-[390px]">
          <img src="/images/hero-monitoring.jpg" alt="Farmer monitoring a crop" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-fasai-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
            <p className="text-sm font-semibold text-fasai-100">{t.liveMonitoring}</p>
            <h3 className="mt-1 text-2xl font-black">{t.seeChanges}</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/95 p-3 text-center text-slate-800 backdrop-blur">
              <div><div className="font-black text-fasai-700">92</div><div className="text-xs text-slate-500">{t.healthScore}</div></div>
              <div><div className="font-black text-fasai-700">0.78</div><div className="text-xs text-slate-500">NDVI</div></div>
              <div><div className="font-black text-fasai-700">31%</div><div className="text-xs text-slate-500">{t.moisture}</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
