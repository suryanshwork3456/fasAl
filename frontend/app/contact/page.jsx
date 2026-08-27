"use client";

import PublicPage from "@/components/public/PublicPage";
import { useLanguage } from "@/hooks/useLanguage";
import { Mail, Phone, MapPin, ChevronDown } from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();
  return <PublicPage title={t.contactTitle} text={t.contactText} image="/images/hero-farmer.jpg">
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      {[[Mail,t.email,t.emailValue],[Phone,t.phone,t.phoneValue],[MapPin,t.location,t.locationValue]].map(([Icon,title,value]) => <div key={title} className="rounded-2xl border border-fasai-100 bg-white p-5 shadow-sm"><Icon className="text-fasai-600"/><h2 className="mt-3 font-black">{title}</h2><p className="mt-1 break-words text-sm text-slate-600">{value}</p></div>)}
    </div>
    <form className="mt-6 rounded-2xl border border-fasai-100 bg-white p-5 shadow-sm sm:p-6" onSubmit={event=>event.preventDefault()}>
      <h2 className="text-xl font-black text-fasai-900">{t.sendMessage}</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <input aria-label={t.name} className="min-h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-fasai-500" placeholder={t.name} />
        <input type="email" aria-label={t.email} className="min-h-12 rounded-xl border border-slate-300 px-4 outline-none focus:border-fasai-500" placeholder={t.email} />
      </div>
      <textarea aria-label={t.message} className="mt-4 min-h-32 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-fasai-500" placeholder={t.message} />
      <button type="submit" className="btn-primary mt-4 w-full sm:w-auto">{t.sendMessageButton}</button>
    </form>
    <section className="mt-8">
      <h2 className="text-xl font-black text-fasai-900">{t.contactFaqTitle}</h2>
      <div className="mt-3 space-y-2">{t.contactFaq.map(([q,a])=><details key={q} className="rounded-2xl border border-slate-200 bg-white p-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-slate-800">{q}<ChevronDown size={18}/></summary><p className="mt-3 text-sm leading-6 text-slate-600">{a}</p></details>)}</div>
    </section>
  </PublicPage>;
}
