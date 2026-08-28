"use client";
import { useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import PageHeader from "@/components/ui/PageHeader";
import FieldMap from "@/components/maps/FieldMap";
import { useLanguage } from "@/hooks/useLanguage";
import { ZoomIn, ZoomOut } from "lucide-react";

export default function Satellite() {
  const { t } = useLanguage();
  const [layer, setLayer] = useState("ndvi");
  const mapRef = useRef(null);

  return <>
    <Navbar dashboard />
    <Sidebar />
    <main className="lg:ml-64">
      <div className="container-fasai py-5">
        <PageHeader title={t.satelliteTitle} description={t.satelliteDescription} />
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {[["ndvi", t.layerNdvi], ["trueColor", t.layerTrueColor], ["moisture", t.layerMoisture]].map(([key, label]) => (
                <button key={key} onClick={() => setLayer(key)} className={`min-h-11 rounded-lg px-3 text-xs font-bold sm:px-4 ${layer === key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}>{label}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => mapRef.current?.zoomIn()} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:border-emerald-300 hover:text-emerald-700" aria-label={t.zoomIn}><ZoomIn size={18} /></button>
              <button type="button" onClick={() => mapRef.current?.zoomOut()} className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 transition hover:border-emerald-300 hover:text-emerald-700" aria-label={t.zoomOut}><ZoomOut size={18} /></button>
            </div>
          </div>
          <div className="mt-4 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <div className="h-[380px] overflow-hidden rounded-2xl border border-slate-100 sm:h-[520px]"><FieldMap ref={mapRef} zoomControl={false} layer={layer} /></div>
            <div className="space-y-4">
              {layer === "moisture" ? (
                <div className="card p-5"><h2 className="font-black">{t.layerMoisture}</h2><div className="mt-3 text-4xl font-black text-sky-700">31%</div><p className="mt-1 text-sm text-slate-500">{t.satelliteHealthy}</p></div>
              ) : layer === "trueColor" ? (
                <div className="card p-5"><h2 className="font-black">{t.layerTrueColor}</h2><p className="mt-3 text-sm leading-6 text-slate-600">Real optical satellite imagery for the same area — useful for visually confirming what NDVI is picking up on (bare soil, canopy cover, water).</p></div>
              ) : (
                <div className="card p-5"><h2 className="font-black">{t.layerNdvi}</h2><div className="mt-3 text-4xl font-black text-fasai-700">0.72</div><p className="mt-1 text-sm text-slate-500">{t.satelliteHealthy}</p></div>
              )}
              <div className="card p-5"><h2 className="font-black">{t.lowNdviZones}</h2><div className="mt-3 h-4 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500" /><div className="mt-2 flex justify-between text-xs text-slate-500"><span>{t.stress}</span><span>{t.healthyLabel}</span></div></div>
              <div className="card p-5"><h2 className="font-black">{t.dataPipeline}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{t.satellitePipelineText}</p></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>;
}
