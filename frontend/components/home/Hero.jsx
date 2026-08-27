"use client";
import Link from "next/link";
import { PlayCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { VIDEO_DEMO_URL } from "@/lib/constants";

const slides=["/images/hero-farmer.jpg","/images/hero-monitoring.jpg","/images/hero-spraying.jpg","/images/hero-planting.jpg","/images/hero-harvest.jpg"];

export default function Hero(){
  const {t}=useLanguage(); const [i,setI]=useState(0);
  useEffect(()=>{const x=setInterval(()=>setI(v=>(v+1)%slides.length),5000);return()=>clearInterval(x)},[]);
  return <section className="hero-bg flex h-[calc(100svh-68px)] items-center overflow-hidden" style={{"--hero-image":`url(${slides[i]})`}}>
    <div className="container-fasai w-full py-10 sm:py-14">
      <div className="max-w-xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fasai-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-fasai-700">🌱 {t.aiMonitoring}</div>
        <h1 className="text-[2.1rem] font-black leading-[1.08] tracking-tight text-fasai-900 sm:text-5xl md:text-6xl">{t.heroTitle1}<br/><span className="text-fasai-600">{t.heroTitle2}</span><br/>{t.heroTitle3}</h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-700 sm:text-lg">{t.heroText}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary"><ArrowRight size={19}/>{t.getStarted}</Link>
          <a href={VIDEO_DEMO_URL} target="_blank" rel="noreferrer" className="btn-secondary"><PlayCircle size={20}/>{t.watchDemo}</a>
        </div>
        <div className="mt-7 flex gap-1">{slides.map((_,n)=><button key={n} onClick={()=>setI(n)} aria-label={`${t.slide} ${n+1}`} className={`h-2 rounded-full transition-all ${n===i?"w-8 bg-fasai-600":"w-3 bg-fasai-200"}`}/>)}</div>
      </div>
    </div>
  </section>
}
