"use client";
import FeatureCard from "./FeatureCard";
import { useLanguage } from "@/hooks/useLanguage";
export default function Features(){const {t}=useLanguage(); return <section className="container-fasai py-14 sm:py-18"><div className="text-center max-w-2xl mx-auto"><p className="text-fasai-600 font-bold">FasAI</p><h2 className="section-title mt-1">{t.helps}</h2></div><div className="grid md:grid-cols-3 gap-5 mt-8"><FeatureCard icon="Camera" title={t.uploadPhoto} text={t.uploadText}/><FeatureCard icon="ScanSearch" title={t.checkHealth} text={t.healthText}/><FeatureCard icon="ClipboardCheck" title={t.recommendations} text={t.recText}/></div></section>}
