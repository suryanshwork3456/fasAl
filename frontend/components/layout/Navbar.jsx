"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus, LogOut, ChevronRight } from "lucide-react";
import { navItems, dashboardItems } from "@/lib/constants";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import Icon from "@/components/ui/Icon";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

export default function Navbar({ dashboard = false }) {
  const path = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const items = dashboard ? dashboardItems : navItems;
  const isActive = (href) => (href === "/" ? path === "/" : path.startsWith(href));
  const close = () => setOpen(false);
  const doLogout = () => {
    logout();
    close();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-[60] border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className={`container-fasai flex items-center justify-between gap-3 ${dashboard ? "h-[64px]" : "h-[68px]"}`}>
        {/* Left group: hamburger (mobile only) + logo */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label={t.menu}
            aria-expanded={open}
          >
            <Menu size={21} />
          </button>

          {dashboard ? (
            <div className="flex min-w-0 cursor-default select-none items-center">
              <img src="/images/fasai-brand.png" alt="FasAI" className="pointer-events-none h-9 w-auto max-w-[135px] object-contain sm:h-10 sm:max-w-[155px]" />
            </div>
          ) : (
            <Link href="/" className="flex min-w-0 items-center" onClick={close} aria-label="FasAI home">
              <img src="/images/fasai-brand.png" alt="FasAI" className="h-9 w-auto max-w-[135px] object-contain sm:h-11 sm:max-w-[155px]" />
            </Link>
          )}
        </div>

        {!dashboard && (
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive(item.href) ? "bg-fasai-50 text-fasai-700" : "text-slate-700 hover:bg-slate-50 hover:text-fasai-700"}`}>
                {t[item.key]}
              </Link>
            ))}
          </nav>
        )}

        {/* Right group: language switcher + login/logout — visible on both mobile and desktop */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden items-center gap-2 lg:flex">
            {dashboard ? (
              user ? <button type="button" onClick={doLogout} className="btn-secondary min-h-11 py-2.5"><LogOut size={17} />{t.logout}</button> : null
            ) : user ? (
              <button type="button" onClick={doLogout} className="btn-secondary min-h-11 py-2.5"><LogOut size={17} />{t.logout}</button>
            ) : (
              <>
                <Link href="/login" className="btn-secondary min-h-11 py-2.5"><LogIn size={17} />{t.login}</Link>
                <Link href="/register" className="btn-primary min-h-11 py-2.5"><UserPlus size={17} />{t.register}</Link>
              </>
            )}
          </div>
          {/* Mobile-only compact login entry point (public pages, logged out) */}
          {!dashboard && !user && (
            <Link href="/login" className="btn-primary min-h-11 px-3.5 py-2.5 text-sm lg:hidden">
              <LogIn size={16} />{t.login}
            </Link>
          )}
        </div>
      </div>

      {/* Full-viewport mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" onClick={close} />
          <aside
            className="absolute inset-y-0 left-0 flex h-[100dvh] w-[82%] max-w-[340px] flex-col bg-white shadow-2xl animate-[slideIn_.18s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-label={t.menu}
          >
            {/* Header: single close button only */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
              <img src="/images/fasai-brand.png" alt="FasAI" className="h-8 w-auto max-w-[120px] object-contain" />
              <button type="button" onClick={close} aria-label={t.close} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            {/* Middle: scrollable nav links */}
            <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {items.map(item => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={close}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 font-semibold ${isActive(item.href) ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {dashboard && <Icon name={item.icon} size={19} className="shrink-0" />}
                  <span className="min-w-0 flex-1 truncate">{t[item.key]}</span>
                  <ChevronRight size={16} className="shrink-0 text-slate-300" />
                </Link>
              ))}
            </nav>

            {/* Footer: pinned actions */}
            <div className="shrink-0 space-y-2 border-t border-slate-100 px-4 pt-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 1.5rem)" }}>
              <LanguageSwitcher variant="block" className="w-full" />
              {dashboard ? (
                <button type="button" onClick={doLogout} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 font-bold text-red-700">
                  <LogOut size={18} />{t.logout}
                </button>
              ) : user ? (
                <button type="button" onClick={doLogout} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 font-bold text-red-700">
                  <LogOut size={18} />{t.logout}
                </button>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Link href="/login" onClick={close} className="btn-primary min-h-12 w-full">{t.login}</Link>
                  <Link href="/register" onClick={close} className="flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-fasai-600 font-bold text-fasai-700">{t.register}</Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
