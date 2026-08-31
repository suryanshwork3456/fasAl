// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowLeft, Satellite, Sprout, CloudSun, Droplets, Bug } from "lucide-react";
// import FieldMap from "@/components/maps/FieldMap";
// import { useLanguage } from "@/hooks/useLanguage";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function FieldDetail({ id }) {
//   const { t } = useLanguage();
//   const [f, setF] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function loadField() {
//       try {
//         const res = await fetch(`${API_BASE}/api/v1/field-form/${id}`);
//         if (!res.ok) throw new Error("Field not found");
//         const data = await res.json();
//         setF(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadField();
//   }, [id]);

//   const display = (value) => t[value?.toLowerCase()] || value;
//   const displaySoil = (value) =>
//     ({
//       Loamy: t.loamy,
//       Clayloam: t.clayLoam,
//       Sandyloam: t.sandyLoam,
//       Blacksoil: t.blackSoil,
//       Alluvial: t.alluvial,
//     }[value] || value);

//   if (loading) return <p className="text-slate-500">Loading field...</p>;
//   if (error || !f) return <p className="text-red-600">{error || "Field not found"}</p>;

//   return (
//     <div>
//       <Link href="/fields" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-600">
//         <ArrowLeft size={16} />
//         {t.back}
//       </Link>
//       <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{f.field_name}</h1>
//           <p className="text-slate-500">
//             {display(f.crop_type)} • {f.location} • {f.field_area} ha
//           </p>
//         </div>
//         <Link href="/crop-health" className="btn-primary">
//           {t.analyze}
//         </Link>
//       </div>
//       <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
//         <div className="card h-[340px] p-3 sm:h-[390px]">
//           <FieldMap boundary={f.boundary} />
//         </div>
//         <div className="grid grid-cols-2 gap-3">
//           <Stat label={t.healthScore} value={f.health ? `${f.health}/100` : "—"} icon={<Sprout />} />
//           <Stat label={t.ndvi} value={f.ndvi ?? "—"} icon={<Satellite />} />
//           <Stat label={t.moisture} value={f.moisture ? `${f.moisture}%` : "—"} icon={<Droplets />} />
//           <Stat label={t.pestRisk} value={f.risk ?? "—"} icon={<Bug />} />
//           <Stat label={t.weather} value="28°C" icon={<CloudSun />} />
//           <Stat label={t.soil} value={displaySoil(f.soil_type)} icon={<Droplets />} />
//         </div>
//       </div>
//       <div className="mt-5 grid gap-4 md:grid-cols-3">
//         <Link href="/crop-health" className="card p-5 hover:border-fasai-300">
//           <Sprout className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.cropHealth}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.cropHealthCard}</p>
//         </Link>
//         <Link href="/soil" className="card p-5 hover:border-fasai-300">
//           <Droplets className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.soil}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.soilCard}</p>
//         </Link>
//         <Link href="/pest-risk" className="card p-5 hover:border-fasai-300">
//           <Bug className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.pestRisk}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.pestCard}</p>
//         </Link>
//       </div>
//     </div>
//   );
// }

// function Stat({ label, value, icon }) {
//   return (
//     <div className="card p-4">
//       <div className="text-fasai-600">{icon}</div>
//       <div className="mt-3 text-xs text-slate-500">{label}</div>
//       <div className="mt-1 font-black">{value}</div>
//     </div>
//   );
// }


// "use client";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { ArrowLeft, Satellite, Sprout, CloudSun, Droplets, Bug } from "lucide-react";
// import FieldMap from "@/components/maps/FieldMap";
// import ZoneDetailPanel from "@/components/fields/ZoneDetailPanel";
// import { useLanguage } from "@/hooks/useLanguage";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function FieldDetail({ id }) {
//   const { t } = useLanguage();
//   const [f, setF] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedCell, setSelectedCell] = useState(null);
//   const [health, setHealth] = useState(null);
//   const [healthLoading, setHealthLoading] = useState(true);

//   useEffect(() => {
//     async function loadField() {
//       try {
//         const res = await fetch(`${API_BASE}/api/v1/field-form/${id}`);
//         if (!res.ok) throw new Error("Field not found");
//         const data = await res.json();
//         setF(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadField();
//   }, [id]);

//   const display = (value) => t[value?.toLowerCase()] || value;
//   const displaySoil = (value) =>
//     ({
//       Loamy: t.loamy,
//       Clayloam: t.clayLoam,
//       Sandyloam: t.sandyLoam,
//       Blacksoil: t.blackSoil,
//       Alluvial: t.alluvial,
//     }[value] || value);

//   if (loading) return <p className="text-slate-500">Loading field...</p>;
//   if (error || !f) return <p className="text-red-600">{error || "Field not found"}</p>;

//   return (
//     <div>
//       <Link href="/fields" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-600">
//         <ArrowLeft size={16} />
//         {t.back}
//       </Link>
//       <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{f.field_name}</h1>
//           <p className="text-slate-500">
//             {display(f.crop_type)} • {f.location} • {f.field_area} ha
//           </p>
//         </div>
//         <Link href={`/crop-health?field=${id}`} className="btn-primary">
//           {t.analyze}
//         </Link>
//       </div>
//       <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
//         <div className="card h-[340px] p-3 sm:h-[390px]">
//           <FieldMap bounds={f.boundary} fieldLabel={f.field_name} ndviValue={f.ndvi} moistureValue={f.moisture} layer="ndvi" onCellSelect={setSelectedCell} />
//         </div>
//         <div className="flex flex-col gap-3">
//           <div className="grid grid-cols-2 gap-3">
//             <Stat label={t.healthScore} value={f.health ? `${f.health}/100` : "—"} icon={<Sprout />} />
//             <Stat label={t.ndvi} value={f.ndvi ?? "—"} icon={<Satellite />} />
//             <Stat label={t.moisture} value={f.moisture ? `${f.moisture}%` : "—"} icon={<Droplets />} />
//             <Stat label={t.pestRisk} value={f.risk ?? "—"} icon={<Bug />} />
//             <Stat label={t.weather} value="28°C" icon={<CloudSun />} />
//             <Stat label={t.soil} value={displaySoil(f.soil_type)} icon={<Droplets />} />
//           </div>
//           <ZoneDetailPanel cell={selectedCell} fieldId={id} />
//         </div>
//       </div>
//       <div className="mt-5 grid gap-4 md:grid-cols-3">
//         <Link href={`/crop-health?field=${id}`} className="card p-5 hover:border-fasai-300">
//           <Sprout className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.cropHealth}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.cropHealthCard}</p>
//         </Link>
//         <Link href={`/soil?field=${id}`} className="card p-5 hover:border-fasai-300">
//           <Droplets className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.soil}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.soilCard}</p>
//         </Link>
//         <Link href={`/pest-risk?field=${id}`} className="card p-5 hover:border-fasai-300">
//           <Bug className="text-fasai-600" />
//           <h3 className="mt-3 font-black">{t.pestRisk}</h3>
//           <p className="mt-1 text-sm text-slate-500">{t.pestCard}</p>
//         </Link>
//       </div>
//     </div>
//   );
// }

// function Stat({ label, value, icon }) {
//   return (
//     <div className="card p-4">
//       <div className="text-fasai-600">{icon}</div>
//       <div className="mt-3 text-xs text-slate-500">{label}</div>
//       <div className="mt-1 font-black">{value}</div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Satellite, Sprout, CloudSun, Droplets, Bug } from "lucide-react";
import FieldMap from "@/components/maps/FieldMap";
import ZoneDetailPanel from "@/components/fields/ZoneDetailPanel";
import { useLanguage } from "@/hooks/useLanguage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// GeoJSON is [lon, lat]; Leaflet wants [lat, lng] — convert once, here.
function boundaryToLatLngArray(boundary) {
  if (!boundary || boundary.type !== "Polygon" || !boundary.coordinates?.[0]) {
    return null;
  }
  return boundary.coordinates[0].map(([lon, lat]) => [lat, lon]);
}

export default function FieldDetail({ id }) {
  const { t } = useLanguage();
  const [f, setF] = useState(null);
  const [ndvi, setNdvi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadField() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/field-form/${id}`);
        if (!res.ok) throw new Error("Field not found");
        const data = await res.json();
        setF(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadField();
  }, [id]);

  useEffect(() => {
    async function loadHealthScore() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/fields/${id}/health-score`);
        if (!res.ok) throw new Error("Health score unavailable");
        const data = await res.json();
        setHealth(data);
      } catch (err) {
        console.error("Health score fetch failed:", err);
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    }
    loadHealthScore();
  }, [id]);

  const display = (value) => t[value?.toLowerCase()] || value;
  const displaySoil = (value) =>
    ({
      Loamy: t.loamy,
      Clayloam: t.clayLoam,
      Sandyloam: t.sandyLoam,
      Blacksoil: t.blackSoil,
      Alluvial: t.alluvial,
    }[value] || value);

  if (loading) return <p className="text-slate-500">Loading field...</p>;
  if (error || !f) return <p className="text-red-600">{error || "Field not found"}</p>;

  const bounds = boundaryToLatLngArray(f.boundary);
  const healthScore = ndvi ? Math.round((ndvi.overall_ndvi + 1) / 2 * 100) : null;

  return (
    <div>
      <Link href="/fields" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-600">
        <ArrowLeft size={16} />
        {t.back}
      </Link>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{f.field_name}</h1>
          <p className="text-slate-500">
            {display(f.crop_type)} • {f.location} • {f.field_area} ha
          </p>
        </div>
        <Link href={`/crop-health?field=${id}`} className="btn-primary">
          {t.analyze}
        </Link>
      </div>

      {!bounds && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-700">
          This field has no saved boundary — map and NDVI can't be shown.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="card h-[340px] p-3 sm:h-[390px]">
          {bounds && (
            <FieldMap
              bounds={bounds}
              grid={ndvi?.grid}
              fieldLabel={f.field_name}
              ndviValue={ndvi?.overall_ndvi?.toFixed(2)}
              layer="ndvi"
              onCellSelect={setSelectedCell}
            />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={t.healthScore}
              value={healthLoading ? "…" : health ? `${health.health_score}/100` : "—"}
              icon={<Sprout />}
            />
            <Stat
              label={t.ndvi}
              value={healthLoading ? "…" : health ? health.ndvi_score : "—"}
              icon={<Satellite />}
            />
            <Stat
              label={t.soil}
              value={healthLoading ? "…" : health ? health.soil_score : displaySoil(f.soil_type)}
              icon={<Droplets />}
            />
            <Stat
              label={t.weather}
              value={healthLoading ? "…" : health && health.weather_available ? health.weather_score : "N/A"}
              icon={<CloudSun />}
            />
            <Stat label={t.moisture} value={f.moisture ? `${f.moisture}%` : "—"} icon={<Droplets />} />
            <Stat label={t.pestRisk} value={f.risk ?? "—"} icon={<Bug />} />
          </div>
          {ndvi && (
            <p className="text-xs font-semibold text-slate-400">
              Source: {ndvi.data_source} • Updated {new Date(ndvi.last_updated).toLocaleDateString()}
            </p>
          )}
          <ZoneDetailPanel cell={selectedCell} fieldId={id} onClose={() => setSelectedCell(null)} />
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Link href={`/crop-health?field=${id}`} className="card p-5 hover:border-fasai-300">
          <Sprout className="text-fasai-600" />
          <h3 className="mt-3 font-black">{t.cropHealth}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.cropHealthCard}</p>
        </Link>
        <Link href={`/soil?field=${id}`} className="card p-5 hover:border-fasai-300">
          <Droplets className="text-fasai-600" />
          <h3 className="mt-3 font-black">{t.soil}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.soilCard}</p>
        </Link>
        <Link href={`/pest-risk?field=${id}`} className="card p-5 hover:border-fasai-300">
          <Bug className="text-fasai-600" />
          <h3 className="mt-3 font-black">{t.pestRisk}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.pestCard}</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="card p-4">
      <div className="text-fasai-600">{icon}</div>
      <div className="mt-3 text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-black">{value}</div>
    </div>
  );
}