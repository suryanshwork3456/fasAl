"use client";
import Icon from "@/components/ui/Icon";
export default function FeatureCard({icon,title,text}){return <div className="card p-6 sm:p-7 hover:-translate-y-1 transition-transform"><div className="h-12 w-12 rounded-2xl bg-fasai-100 text-fasai-700 flex items-center justify-center mb-5"><Icon name={icon} size={25}/></div><h3 className="text-xl font-extrabold text-fasai-900">{title}</h3><p className="mt-2 text-slate-600 leading-6">{text}</p></div>}
