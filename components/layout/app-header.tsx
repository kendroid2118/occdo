"use client";

import { usePathname } from "next/navigation";

import { titleForPath } from "@/components/layout/nav-config";

export function AppHeader() {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Ormoc City Cooperatives Development Office
        </p>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <p className="text-sm text-slate-500">Internal MIS — sign-in arrives in M1</p>
    </header>
  );
}
