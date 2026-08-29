"use client";
import { cropHealthByField, defaultCropHealth } from "@/mocks/cropHealth";
import { fields } from "@/mocks/fields";
import { useLanguage } from "@/hooks/useLanguage";
import { buildAssessment } from "@/lib/recommendation";
import { CheckCircle2, TriangleAlert, ClipboardList, Sparkles, ListChecks } from "lucide-react";

export default function CropHealthPanel({ fieldId }){
  const {t}=useLanguage();
  const field = fields.find(f=>f.id===fieldId) || fields[0];
  const cropHealth = cropHealthByField[field.id] || defaultCropHealth;
  const displayFieldName=(name)=>name==="North Field"?t.northField:name==="South Field"?t.southField:t.eastField;

  const assessment = buildAssessment(
    { ndvi: cropHealth.ndvi, stressedArea: cropHealth.stressedArea, moisture: cropHealth.moisture, tempC: cropHealth.tempC },
    t
  );

  return <div>
    <p className="mb-4 -mt-2 text-sm font-bold text-fasai-700">{displayFieldName(field.name)}</p>

    <SectionLabel icon={<ClipboardList size={16}/>} text={t.measuredData || "Measured Data"} />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Metric l={t.healthScore} v={`${cropHealth.score}/100`}/>
      <Metric l={t.ndvi} v={cropHealth.ndvi}/>
      <Metric l={t.stressedArea} v={`${cropHealth.stressedArea}%`}/>
      <Metric l={t.moisture} v={cropHealth.moisture != null ? `${cropHealth.moisture}%` : "—"}/>
    </div>
    <p className="mt-2 text-[11px] text-slate-400">{t.demoDataLabel || "Demo data — not a real satellite reading."}</p>

    <SectionLabel icon={<Sparkles size={16}/>} text={t.aiAssessment || "AI Assessment"} className="mt-6" />
    <div className="card p-4 text-sm leading-6 text-slate-700">{assessment.aiAssessment}</div>

    <SectionLabel icon={<ListChecks size={16}/>} text={t.recommendation || "Recommendation"} className="mt-4" />
    <div className={`card p-4 text-sm font-bold leading-6 ${
      assessment.status === "healthy" ? "bg-fasai-50 text-fasai-700" :
      assessment.status === "moderate" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
    }`}>{assessment.recommendation}</div>
    <p className="mt-2 text-[11px] text-slate-400">
      {t.recommendationDisclaimer || "This is a general suggestion, not a substitute for expert or agronomist advice."}
    </p>

    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className="card p-5"><h2 className="text-lg font-black">{t.healthTrend}</h2><div className="mt-5 flex h-48 items-end gap-2">{cropHealth.trend.map((v,i)=><div key={i} className="flex-1 rounded-t-lg bg-fasai-400" style={{height:`${v}%`}}><span className="-mt-5 block text-center text-[10px]">{v}</span></div>)}</div></div>
      <div className="card p-5"><h2 className="text-lg font-black">{t.stressZones}</h2><div className="mt-4 space-y-3">{cropHealth.zones.map(z=><div key={z.name} className="flex items-center justify-between border-b pb-3 last:border-0"><div className="flex items-center gap-2">{z.value==="Healthy"?<CheckCircle2 className="text-fasai-600"/>:<TriangleAlert className="text-amber-500"/>}{z.name==="North-West"?t.northWest:t.southEast}</div><span className="text-sm font-bold">{z.value==="Healthy"?t.healthy:t.waterStress}</span></div>)}</div></div>
    </div>
  </div>;
}

function SectionLabel({icon,text,className=""}){
  return <div className={`mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 ${className}`}>{icon}{text}</div>;
}
function Metric({l,v}){return <div className="card p-5"><div className="text-xs text-slate-500">{l}</div><div className="mt-2 text-2xl font-black text-fasai-800">{v}</div></div>}