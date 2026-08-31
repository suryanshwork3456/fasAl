"use client";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import FieldVisual from "@/components/maps/FieldVisual";
import { authFetch } from "@/lib/api";

export default function FieldList() {
  const { t } = useLanguage();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    async function loadFields() {
      try {
        const data = await authFetch("/api/v1/field-form/");
        setFields(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, []);

  const displaySoil = (value) =>
    ({
      Loamy: t.loamy,
      Clayloam: t.clayLoam,
      Sandyloam: t.sandyLoam,
      Blacksoil: t.blackSoil,
      Alluvial: t.alluvial,
    }[value] || value);

  const displayCrop = (value) => t[value?.toLowerCase()] || value;

  const list = fields.filter((f) =>
    `${f.field_name} ${f.crop_type} ${f.location}`.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{t.fields}</h1>
          <p className="text-slate-500">{t.fieldsDescription}</p>
        </div>
        <Link href="/fields/new" className="btn-primary">
          <Plus size={18} />
          {t.addField}
        </Link>
      </div>

      <div className="card mb-5 flex min-h-12 items-center gap-2 p-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.search}
          className="min-w-0 flex-1 outline-none"
        />
      </div>

      {loading && <p className="text-slate-500">Loading fields...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && list.length === 0 && (
        <p className="text-slate-500">No fields yet. Add your first one.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((f) => (
          <Link
            href={`/fields/${f.id}`}
            key={f.id}
            className="card overflow-hidden transition hover:border-fasai-300"
          >
            <div className="aspect-[16/7] bg-slate-900">
              <FieldVisual layer="ndvi" seed={f.id} value={f.ndvi ?? 0} className="h-full w-full" />
            </div>
            <div className="p-5">
              <div className="flex justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black">{f.field_name}</h2>
                  <p className="text-sm text-slate-500">
                    {displayCrop(f.crop_type)} • {f.location}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-fasai-50 px-2 py-1 text-xs font-bold text-fasai-700">
                  {f.health ?? "—"}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="block text-slate-500">{t.area}</span>
                  <b>{f.field_area} ha</b>
                </div>
                <div>
                  <span className="block text-slate-500">{t.ndvi}</span>
                  <b>{f.ndvi ?? "—"}</b>
                </div>
                <div>
                  <span className="block text-slate-500">{t.moisture}</span>
                  <b>{f.moisture ?? "—"}%</b>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
