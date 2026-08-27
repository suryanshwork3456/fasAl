"use client";

import Link from "next/link";
import { useState } from "react";
import { Satellite, Map, Bell, Droplets, Bot, FileBarChart, ZoomIn, ZoomOut, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { fields } from "@/mocks/fields";
import { alerts } from "@/mocks/alerts";
import FieldVisual from "@/components/maps/FieldVisual";

const layers = ["ndvi", "trueColor", "moisture"];

export default function DashboardOverview() {
  const { t } = useLanguage();
  const [layer, setLayer] = useState("ndvi");
  const [zoom, setZoom] = useState(1);
  const zoomIn = () => setZoom(z => Math.min(2.5, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(1, +(z - 0.25).toFixed(2)));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{t.welcomeDashboard}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-fasai-900 sm:text-3xl">{t.dashboard}</h1>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">{t.dashboardDescription}</p>
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label={t.overallCropHealth} value="82" suffix="/100" sub={t.good} icon={<HealthRing score={82} />} />
        <MetricCard label={t.totalFields} value={fields.length} sub={t.activeFields} icon={<div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Map size={21} /></div>} />
        <MetricCard label={t.activeAlerts} value="3" sub={t.requiresAttention} icon={<div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Bell size={21} /></div>} />
        <MetricCard label={t.nextIrrigation} value="2" suffix={` ${t.days}`} sub={t.northField} icon={<div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-sky-600"><Droplets size={21} /></div>} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t.satellite}</h2>
              <p className="mt-1 text-xs text-slate-500">{t.demoNdvi}</p>
            </div>
            <Link href="/satellite" className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">{t.openMap}<ArrowRight size={16}/></Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {layers.map(key => <button key={key} onClick={() => setLayer(key)} className={`min-h-11 rounded-lg px-3 text-xs font-bold sm:px-4 ${layer === key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}>{t[`layer${key === "ndvi" ? "Ndvi" : key === "trueColor" ? "TrueColor" : "Moisture"}`]}</button>)}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={zoomIn} disabled={zoom>=2.5} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label={t.zoomIn}><ZoomIn size={18}/></button>
              <button type="button" onClick={zoomOut} disabled={zoom<=1} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40" aria-label={t.zoomOut}><ZoomOut size={18}/></button>
            </div>
          </div>

          <div className={`relative mt-4 h-[280px] overflow-hidden rounded-2xl bg-slate-900 sm:h-[350px]`}>
            <div className="h-full w-full transition-transform duration-300 ease-out" style={{ transform: `scale(${zoom})` }}>
              <FieldVisual layer={layer} seed="dashboard-overview" value={layer === "moisture" ? 31 : 0.72} className="h-full w-full" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-slate-950/5" />
            <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur">{t.demoLabel || "Demo layer"}</div>
            <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">{layer === "ndvi" ? "NDVI 0.72" : layer === "trueColor" ? t.layerTrueColor : "Moisture 31%"}</div>
            <div className="absolute bottom-3 right-3 rounded-xl bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm backdrop-blur">{Math.round(zoom*100)}%</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-black text-slate-900">{t.recentAlerts}</h2>
            <Link href="/alerts" className="text-sm font-bold text-emerald-700">{t.viewAll}</Link>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.map(a => {
              const cfg = a.level === "High" ? { bg: "bg-red-50", text: "text-red-700", label: t.critical, dot: "bg-red-500" } : a.level === "Medium" ? { bg: "bg-amber-50", text: "text-amber-700", label: t.warning, dot: "bg-amber-500" } : { bg: "bg-sky-50", text: "text-sky-700", label: t.info, dot: "bg-sky-500" };
              const title = a.id === 1 ? t.highPestRisk : a.id === 2 ? t.waterStress : t.rainfallAlert;
              return <div key={a.id} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-extrabold text-slate-900">{title}</p><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{t[a.textKey]}</p><p className="mt-2 text-[11px] font-semibold text-slate-400">{t[a.timeKey]}</p></div></div>
              </div>;
            })}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <QuickLink href="/fields" icon={<Map />} label={t.fields} />
        <QuickLink href="/satellite" icon={<Satellite />} label={t.satellite} />
        <QuickLink href="/diagnose" icon={<Bot />} label={t.assistant} />
        <QuickLink href="/analytics" icon={<FileBarChart />} label={t.reports} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix, sub, icon }) {
  return <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2"><p className="text-xs font-bold leading-5 text-slate-500 sm:text-sm">{label}</p>{icon}</div><div className="mt-3 flex items-baseline gap-1"><span className="text-2xl font-black text-slate-900 sm:text-3xl">{value}</span>{suffix && <span className="text-xs font-bold text-slate-500">{suffix}</span>}</div><p className="mt-1 truncate text-xs font-semibold text-slate-500">{sub}</p></div>;
}

function HealthRing({ score }) { return <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{background:`conic-gradient(#22c55e ${score * 3.6}deg,#dcfce7 0deg)`}}><div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-black text-emerald-700">{score}</div></div>; }
function QuickLink({href,icon,label}) { return <Link href={href} className="flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200"><span className="text-emerald-600">{icon}</span><span className="text-sm font-extrabold text-slate-800">{label}</span></Link>; }
