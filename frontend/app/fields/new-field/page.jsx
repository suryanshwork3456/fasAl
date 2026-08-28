"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import FieldMap from "@/components/maps/FieldMap";
import { useLanguage } from "@/hooks/useLanguage";
export default function NewFieldCreated(){const {t}=useLanguage();const [f,setF]=useState(null);useEffect(()=>{try{setF(JSON.parse(localStorage.getItem("fasai_new_field")))}catch{}},[]);return <><Navbar dashboard/><Sidebar/><main className="lg:ml-64"><div className="container-fasai py-5"><div className="mb-5"><h1 className="text-2xl font-black text-fasai-900 sm:text-3xl">{f?.name||t.newField}</h1><p className="mt-1 text-slate-500">{t.fieldCreated}</p></div><div className="grid gap-5 lg:grid-cols-2"><div className="card h-[360px] p-3 sm:h-[420px]"><FieldMap/></div><div className="card p-5"><div className="grid grid-cols-2 gap-4">{f&&Object.entries(f).filter(([k])=>k!=="boundary").map(([k,v])=><div key={k}><div className="text-xs text-slate-500">{k}</div><div className="mt-1 font-bold">{v||"—"}</div></div>)}</div><Link href="/fields" className="btn-primary mt-6">{t.fields}</Link></div></div></div></main></>}
