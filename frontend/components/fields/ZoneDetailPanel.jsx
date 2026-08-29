
"use client";
import Link from "next/link";
import { Sprout, Droplets, Bug, MapPin, Camera, Search } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_LABEL_KEY = { healthy: "healthy", moderate: "moderateStatus", stressed: "waterStress" };

export default function ZoneDetailPanel({ cell, fieldId }) {
  const { t } = useLanguage();
  if (!cell) {
    return (
      <div className="card p-5 text-sm text-slate-500">
        {t.zoneDetailEmpty || "Tap a square on the map to see details for that part of the field."}
      </div>
    );
  }

  const statusLabel = t[STATUS_LABEL_KEY[cell.status]] || cell.status;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
        <MapPin size={14} />
        {t.zoneLabel || "Zone"} R{cell.row + 1}-C{cell.col + 1}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <Sprout size={16} className="mx-auto text-fasai-600" />
          <div className="mt-1 text-lg font-black">{cell.ndvi}</div>
          <div className="text-[11px] text-slate-500">{t.ndvi}</div>
        </div>
        <div>
          <Droplets size={16} className="mx-auto text-sky-600" />
          <div className="mt-1 text-lg font-black">{cell.moisture}%</div>
          <div className="text-[11px] text-slate-500">{t.moisture}</div>
        </div>
        <div>
          <Bug size={16} className="mx-auto text-amber-600" />
          <div className="mt-1 text-lg font-black">{cell.pestRisk}%</div>
          <div className="text-[11px] text-slate-500">{t.pestRisk}</div>
        </div>
      </div>
      <div className={`mt-4 rounded-lg px-3 py-2 text-center text-sm font-bold ${
        cell.status === "healthy" ? "bg-fasai-50 text-fasai-700" :
        cell.status === "moderate" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
      }`}>
        {t.possibleConcern || "Status"}: {statusLabel}
      </div>
      <div className="mt-4 flex gap-2">
        <Link href={fieldId ? `/fields/${fieldId}` : "/fields"} className="btn-secondary flex flex-1 items-center justify-center gap-2 text-sm">
          <Search size={16} />{t.inspect || "Inspect"}
        </Link>
        <Link href={fieldId ? `/diagnose?field=${fieldId}` : "/diagnose"} className="btn-primary flex flex-1 items-center justify-center gap-2 text-sm">
          <Camera size={16} />{t.uploadPhoto || "Upload Photo"}
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">{t.demoDataLabel || "Demo data — not a real satellite reading."}</p>
    </div>
  );
}