"use client";
import { useState } from "react";
import Link from "next/link";
import { User, Phone, ArrowRight } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import OtpForm from "@/components/auth/OtpForm";
import { useLanguage } from "@/hooks/useLanguage";

export default function RegisterPage(){
  const {t}=useLanguage(); const [name,setName]=useState(""); const [mobile,setMobile]=useState(""); const [step,setStep]=useState(1);
  return <AuthShell mode="register">{step===1 ? <div>
    <h1 className="text-2xl font-black tracking-tight text-fasai-900 sm:text-3xl">{t.createAccount}</h1>
    <p className="mt-2 text-sm leading-6 text-slate-500">{t.registerText}</p>
    <div className="mt-6 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-800">{t.fullName}</span>
        <div className="flex min-h-12 overflow-hidden rounded-xl border border-slate-300 transition focus-within:border-fasai-500 focus-within:ring-2 focus-within:ring-fasai-100">
          <span className="flex items-center bg-slate-50 px-3 text-slate-500"><User size={18}/></span>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.enterName} className="min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-slate-400" />
        </div>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-800">{t.mobile}</span>
        <div className="flex min-h-12 overflow-hidden rounded-xl border border-slate-300 transition focus-within:border-fasai-500 focus-within:ring-2 focus-within:ring-fasai-100">
          <span className="flex items-center gap-2 border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600"><Phone size={18}/> +91</span>
          <input value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,"").slice(0,10))} inputMode="numeric" placeholder={t.enterMobile} className="min-w-0 flex-1 px-4 text-sm outline-none placeholder:text-slate-400" />
        </div>
      </label>
    </div>
    <button disabled={!name.trim()||mobile.length!==10} onClick={()=>setStep(2)} className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight size={18}/>{t.continue}</button>
    <p className="mt-5 text-center text-sm text-slate-500">{t.login}? <Link className="font-bold text-fasai-700 hover:underline" href="/login">{t.login}</Link></p>
  </div> : <OtpForm mode="register" mobile={mobile} name={name}/>}</AuthShell>
}
