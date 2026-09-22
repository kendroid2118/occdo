import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getCurrentSessionUser } from "@/lib/auth/current-session";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="sticky top-0 h-screen">
        <AppSidebar />
      </div>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader sessionEmail={sessionUser?.email ?? null} />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
