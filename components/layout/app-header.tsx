"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { titleForPath } from "@/components/layout/nav-config";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

type AppHeaderProps = {
  sessionEmail?: string | null;
};

export function AppHeader({ sessionEmail = null }: AppHeaderProps) {
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
      {sessionEmail ? (
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate text-sm text-slate-600">{sessionEmail}</p>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <Link
          className="text-sm font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          href="/login"
        >
          Sign in
        </Link>
      )}
    </header>
  );
}
