"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
export default function OtpForm({ mode, mobile, name }) {
  const {t}=useLanguage(); const {login}=useAuth(); const router=useRouter(); const [otp,setOtp]=useState(["","","","","",""]); const [error,setError]=useState("");
  const onChange=(v,i)=>{if(!/^\d?$/.test(v))return;const a=[...otp];a[i]=v;setOtp(a);if(v&&i<5)document.getElementById(`otp-${i+1}`)?.focus()};
  const verify=()=>{if(otp.join("")!=="123456"){setError(t.invalidOtp);return;}login({name:name||t.profileRole,mobile});router.push("/dashboard")};
  return <div className="space-y-6">
    <button onClick={()=>location.reload()} className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-fasai-700"><ArrowLeft size={17}/>{t.back}</button>
    <div>
      <h2 className="text-2xl font-black tracking-tight text-fasai-900">{t.otpTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{t.otpText}</p>
      <p className="mt-1 font-semibold text-fasai-700">+91 {mobile}</p>
    </div>
    <div className="flex justify-between gap-2">{otp.map((v,i)=><input key={i} id={`otp-${i}`} value={v} maxLength={1} inputMode="numeric" onChange={e=>onChange(e.target.value,i)} className="h-12 w-11 min-w-0 flex-1 rounded-xl border border-slate-300 text-center text-xl font-black outline-none transition focus:border-fasai-600 focus:ring-2 focus:ring-fasai-100 sm:h-14 sm:w-12 sm:flex-none"/>)}</div>
    {error&&<p className="text-sm font-semibold text-red-600">{error}</p>}
    <button onClick={verify} className="btn-primary w-full"><CheckCircle2 size={19}/>{t.verify}</button>
    <button className="w-full text-sm font-bold text-fasai-700 transition hover:underline">{t.resend}</button>
    <p className="text-center text-xs font-semibold text-slate-400">{t.demoMode}: 123456</p>
  </div>
}
