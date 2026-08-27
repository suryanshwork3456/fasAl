"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { dashboardItems } from "@/lib/constants";

export default function Sidebar() {
  const path = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const profileName = user?.name || t.profileName;

  return (
    <aside className="fixed bottom-0 left-0 top-[64px] z-40 hidden min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-3 py-5">
        <div className="mb-5 flex items-center gap-3 px-3">
          <img src="/images/fasai-brand.png" alt="FasAI" className="h-10 w-auto max-w-[140px] object-contain" />
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {dashboardItems.map(item => {
            const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
            return (
              <Link key={item.key} href={item.href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <Icon name={item.icon} size={19} />
                <span>{t[item.key]}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
              {profileName.split(" ").map(x => x[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">{profileName}</p>
              <p className="text-xs font-semibold text-slate-500">{t.profileRole}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
