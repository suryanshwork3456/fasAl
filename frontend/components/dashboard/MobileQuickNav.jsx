"use client";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/hooks/useLanguage";
const items=[["fields","/fields","Map"],["weather","/weather","CloudSun"],["cropHealth","/crop-health","Sprout"],["alerts","/alerts","Bell"],["assistant","/diagnose","Bot"]];
export default function MobileQuickNav(){const {t}=useLanguage();return <div className="lg:hidden grid grid-cols-5 gap-1 bg-white border rounded-2xl p-2 mb-5 sticky top-[74px] z-30">{items.map(([k,h,i])=><Link key={k} href={h} className="flex flex-col items-center gap-1 text-[10px] font-bold text-slate-600 py-2 rounded-xl hover:bg-fasai-50"><Icon name={i} size={18}/>{t[k]}</Link>)}</div>}
