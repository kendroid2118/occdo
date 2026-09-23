import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnnouncementForm } from "@/components/calendar/announcement-form";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "New announcement",
};

export default async function NewAnnouncementPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">New announcement</h2>
        <p className="mt-1 text-sm text-slate-600">
          Publish a plain-text notice for the dashboard. Unpublished, inactive, or expired items
          stay hidden.
        </p>
      </div>
      <AnnouncementForm />
    </div>
  );
}
