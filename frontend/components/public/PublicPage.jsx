"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicPage({ title, text, image, children, eyebrow = "FasAI" }) {
  return <>
    <Navbar />
    <main className="page-shell">
      <section className="relative overflow-hidden bg-fasai-50">
        <div className="absolute inset-0 bg-[url('/images/hero-monitoring.jpg')] bg-cover bg-center opacity-10" />
        <div className="container-fasai relative grid items-start gap-8 py-10 sm:py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-16">
          <div>
            <p className="font-bold uppercase tracking-[0.18em] text-fasai-600">{eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-fasai-900 sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">{text}</p>
            {children}
          </div>
          <div className="relative lg:sticky lg:top-24">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/50 blur-2xl" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[16/10]"><img src={image} alt="FasAI agriculture" className="h-full w-full object-cover" /></div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>;
}
