import type { Metadata } from "next";
import Link from "next/link";

import { AnnouncementList } from "@/components/calendar/announcement-list";
import { listPublishedAnnouncementsAction } from "@/lib/actions/announcements";
import { ANNOUNCEMENT_ACTION_ERROR_MESSAGE } from "@/lib/announcements/form-errors";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "Announcements",
};

export default async function CalendarAnnouncementsPage() {
  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const result = await listPublishedAnnouncementsAction({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Announcements</h2>
          <p className="mt-1 text-sm text-slate-600">
            Published, active, and unexpired notices. Dates use Asia/Manila.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/calendar/announcements/new"
          >
            New announcement
          </Link>
        ) : null}
      </div>

      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {ANNOUNCEMENT_ACTION_ERROR_MESSAGE[result.code]}
        </p>
      ) : (
        <AnnouncementList items={result.data} />
      )}
    </div>
  );
}
