import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalendarActivityForm } from "@/components/calendar/calendar-activity-form";
import {
  getCalendarActivityAction,
  listCalendarLinkOptionsAction,
} from "@/lib/actions/calendar";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "Edit calendar activity",
};

type EditCalendarActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCalendarActivityPage({
  params,
}: EditCalendarActivityPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const { id } = await params;
  const [activityResult, linksResult] = await Promise.all([
    getCalendarActivityAction({ id }),
    listCalendarLinkOptionsAction({}),
  ]);

  if (!activityResult.ok) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Edit activity</h2>
        <p className="mt-1 text-sm text-slate-600">
          Update this calendar item. Times are stored from Asia/Manila.
        </p>
      </div>
      {linksResult.ok ? (
        <CalendarActivityForm activity={activityResult.data} links={linksResult.data} />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load calendar link options.
        </p>
      )}
    </div>
  );
}
