// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import FieldMap from "@/components/maps/FieldMap";
// import { useLanguage } from "@/hooks/useLanguage";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export default function CreateFieldForm() {
//   const { t } = useLanguage();
//   const router = useRouter();
//   const [boundary, setBoundary] = useState(null);
//   const [form, setForm] = useState({
//     name: "",
//     crop: "Wheat",
//     area: "",
//     location: "",
//     soil: "Loamy",
//     sowing: "",
//     harvest: "",
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);

//   const set = (k, v) => setForm({ ...form, [k]: v });

//   const cropOptions = [
//     ["Wheat", t.wheat],
//     ["Rice", t.rice],
//     ["Maize", t.maize],
//     ["Cotton", t.cotton],
//     ["Vegetables", t.vegetables],
//   ];

//   // values must match backend SoilType enum exactly: Loamy, Clayloam, Sandyloam, Blacksoil, Alluvial
//   const soilOptions = [
//     ["Loamy", t.loamy],
//     ["Clayloam", t.clayLoam],
//     ["Sandyloam", t.sandyLoam],
//     ["Blacksoil", t.blackSoil],
//     ["Alluvial", t.alluvial],
//   ];

//   async function handleCreate() {
//     setSaving(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/api/v1/field-form/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           field_name: form.name,
//           field_area: form.area ? parseFloat(form.area) : 0,
//           location: form.location,
//           date_of_sowing: form.sowing,
//           date_of_harvest: form.harvest,
//           crop_type: form.crop,
//           soil_type: form.soil,
//           boundary: boundary,
//         }),
//       });

//       if (!res.ok) {
//         const detail = await res.json().catch(() => null);
//         throw new Error(detail?.detail ? JSON.stringify(detail.detail) : "Failed to create field");
//       }

//       const created = await res.json();
//       router.push(`/fields`);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div>
//       <div className="mb-5">
//         <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{t.addField}</h1>
//         <p className="mt-1 text-slate-500">{t.selectBoundary}</p>
//       </div>
//       <div className="grid gap-5 xl:grid-cols-[1.3fr_.8fr]">
//         <div className="card h-[360px] p-3 sm:h-[420px]">
//           <FieldMap draw onBoundaryChange={setBoundary} />
//         </div>
//         <div className="card p-5">
//           <div className="grid gap-4 sm:grid-cols-2">
//             {[
//               ["name", t.fieldName, "text"],
//               ["area", t.area, "number"],
//               ["location", t.location, "text"],
//               ["sowing", t.sowingDate, "date"],
//               ["harvest", t.harvestingDate, "date"],
//             ].map(([k, l, type]) => (
//               <label key={k} className="block">
//                 <span className="text-sm font-bold">{l}</span>
//                 <input
//                   type={type}
//                   value={form[k]}
//                   onChange={(e) => set(k, e.target.value)}
//                   className="mt-1 min-h-12 w-full rounded-xl border p-3 outline-none focus:border-fasai-500"
//                 />
//               </label>
//             ))}
//             <label>
//               <span className="text-sm font-bold">{t.cropType}</span>
//               <select
//                 value={form.crop}
//                 onChange={(e) => set("crop", e.target.value)}
//                 className="mt-1 min-h-12 w-full rounded-xl border p-3"
//               >
//                 {cropOptions.map(([v, l]) => (
//                   <option key={v} value={v}>{l}</option>
//                 ))}
//               </select>
//             </label>
//             <label>
//               <span className="text-sm font-bold">{t.soilType}</span>
//               <select
//                 value={form.soil}
//                 onChange={(e) => set("soil", e.target.value)}
//                 className="mt-1 min-h-12 w-full rounded-xl border p-3"
//               >
//                 {soilOptions.map(([v, l]) => (
//                   <option key={v} value={v}>{l}</option>
//                 ))}
//               </select>
//             </label>
//           </div>

//           {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

//           <div className="mt-6 flex gap-2">
//             <button onClick={() => router.back()} className="btn-secondary flex-1">
//               {t.cancel}
//             </button>
//             <button
//               onClick={handleCreate}
//               disabled={!form.name || !form.location || saving}
//               className="btn-primary flex-1 disabled:opacity-40"
//             >
//               {saving ? "..." : t.createField}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FieldMap from "@/components/maps/FieldMap";
import { useLanguage } from "@/hooks/useLanguage";
import { polygonAreaHectares } from "@/lib/geo";
import { authFetch } from "@/lib/api";

export default function CreateFieldForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [boundary, setBoundary] = useState(null);
  const [form, setForm] = useState({
    name: "",
    crop: "Wheat",
    area: "",
    location: "",
    soil: "Loamy",
    sowing: "",
    harvest: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm({ ...form, [k]: v });

  useEffect(() => {
    const hectares = polygonAreaHectares(boundary);
    if (hectares !== null) set("area", hectares);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boundary]);

  const cropOptions = [
    ["Wheat", t.wheat],
    ["Rice", t.rice],
    ["Maize", t.maize],
    ["Cotton", t.cotton],
    ["Vegetables", t.vegetables],
  ];

  const soilOptions = [
    ["Loamy", t.loamy],
    ["Clayloam", t.clayLoam],
    ["Sandyloam", t.sandyLoam],
    ["Blacksoil", t.blackSoil],
    ["Alluvial", t.alluvial],
  ];

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await authFetch("/api/v1/field-form/", {
        method: "POST",
        body: JSON.stringify({
          field_name: form.name,
          field_area: form.area ? parseFloat(form.area) : 0,
          location: form.location,
          date_of_sowing: form.sowing,
          date_of_harvest: form.harvest,
          crop_type: form.crop,
          soil_type: form.soil,
          boundary: boundary,
        }),
      });

      router.push(`/fields`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{t.addField}</h1>
        <p className="mt-1 text-slate-500">{t.selectBoundary}</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.8fr]">
        <div className="card h-[360px] p-3 sm:h-[420px]">
          <FieldMap draw onBoundaryChange={setBoundary} />
        </div>
        <div className="card p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold">{t.fieldName}</span>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3 outline-none focus:border-fasai-500" />
            </label>

            <label className="block">
              <span className="text-sm font-bold">{t.area}</span>
              <div className="relative mt-1">
                <input
                  type="number"
                  value={form.area}
                  readOnly
                  placeholder={t.areaAutoPlaceholder || "Draw boundary to calculate"}
                  className="min-h-12 w-full rounded-xl border bg-slate-50 p-3 pr-16 text-slate-700 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ha</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{t.areaAutoHint || "Auto-calculated from the boundary you draw on the map"}</p>
            </label>

            <label className="block">
              <span className="text-sm font-bold">{t.location}</span>
              <input type="text" value={form.location} onChange={(e) => set("location", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3 outline-none focus:border-fasai-500" />
            </label>
            <label className="block">
              <span className="text-sm font-bold">{t.sowingDate}</span>
              <input type="date" value={form.sowing} onChange={(e) => set("sowing", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3 outline-none focus:border-fasai-500" />
            </label>
            <label className="block">
              <span className="text-sm font-bold">{t.harvestingDate}</span>
              <input type="date" value={form.harvest} onChange={(e) => set("harvest", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3 outline-none focus:border-fasai-500" />
            </label>

            <label>
              <span className="text-sm font-bold">{t.cropType}</span>
              <select value={form.crop} onChange={(e) => set("crop", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3">
                {cropOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label>
              <span className="text-sm font-bold">{t.soilType}</span>
              <select value={form.soil} onChange={(e) => set("soil", e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border p-3">
                {soilOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </div>

          {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

          <div className="mt-6 flex gap-2">
            <button onClick={() => router.back()} className="btn-secondary flex-1">{t.cancel}</button>
            <button
              onClick={handleCreate}
              disabled={!form.name || !form.location || saving}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              {saving ? "..." : t.createField}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}