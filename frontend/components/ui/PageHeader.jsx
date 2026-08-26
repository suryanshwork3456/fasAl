"use client";
export default function PageHeader({title,description,action}){return <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"><div><h1 className="text-3xl font-black text-fasai-900">{title}</h1>{description&&<p className="text-slate-500 mt-1">{description}</p>}</div>{action}</div>}
