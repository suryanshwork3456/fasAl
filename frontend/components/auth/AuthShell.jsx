"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function AuthShell({ children, mode }) {
  const { t } = useLanguage();
  const isLogin = mode === "login";

  return (
    <main className="min-h-dvh bg-slate-100 lg:h-dvh lg:overflow-hidden">
      <div className="grid min-h-dvh lg:h-full lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-fasai-900 lg:flex lg:flex-col lg:p-12 xl:p-16">
          <div className="absolute inset-0 bg-[url('/images/hero-farmer.jpg')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-fasai-900 via-fasai-900/95 to-fasai-800/90" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fasai-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-fasai-300/10 blur-3xl" />

          <div className="relative z-10">
            <Link href="/" className="inline-flex rounded-xl bg-white/95 p-2 shadow-lg"><img src="/images/fasai-brand.png" alt="FasAI" className="h-11 w-auto" /></Link>
          </div>

          <div className="relative z-10 flex flex-1 max-w-lg flex-col justify-center gap-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-fasai-100 backdrop-blur">{t.aiMonitoring}</p>
              <h1 className="mt-5 text-4xl font-black leading-tight text-white xl:text-[3.25rem] xl:leading-[1.05]">{isLogin ? t.welcomeBack : t.createAccount}</h1>
              <p className="mt-4 max-w-md text-base leading-7 text-white/75">{isLogin ? t.loginText : t.registerText}</p>
            </div>

            <div className="flex items-end gap-5">
              <img src="/images/auth-farmer.svg" alt="Farmer using FasAI" className="h-36 w-36 shrink-0 rounded-[1.75rem] object-cover shadow-2xl ring-1 ring-white/10 xl:h-44 xl:w-44" />
              <div className="grid gap-3 pb-1 text-white/85">
                <div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-fasai-400" />{t.farmerFriendly}</div>
                <div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-fasai-400" />{t.quick}</div>
                <div className="flex items-center gap-2 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-fasai-400" />{t.secure}</div>
              </div>
            </div>
          </div>

          <p className="relative z-10 flex items-center gap-2 text-xs font-semibold text-white/60"><ShieldCheck size={15} />FasAI • Smart Crop Intelligence</p>
        </section>

        <section className="flex min-h-dvh flex-col bg-white lg:h-full lg:min-h-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-600 transition hover:text-fasai-700"><ArrowLeft size={17}/>{t.back}</Link>
            <LanguageSwitcher />
          </div>
          <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8 lg:min-h-0 lg:overflow-y-auto lg:px-12 lg:py-10">
            <div className="w-full max-w-md">
              <div className="mb-6 flex justify-center lg:hidden"><img src="/images/fasai-brand.png" alt="FasAI" className="h-12 w-auto" /></div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8">{children}</div>
              <p className="mt-5 text-center text-xs font-semibold text-slate-400">FasAI • Smart Crop Intelligence</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
