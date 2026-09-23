import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalendarActivityForm } from "@/components/calendar/calendar-activity-form";
import { listCalendarLinkOptionsAction } from "@/lib/actions/calendar";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "New calendar activity",
};

export default async function NewCalendarActivityPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const linksResult = await listCalendarLinkOptionsAction({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">New activity</h2>
        <p className="mt-1 text-sm text-slate-600">
          Create an office calendar item. Optional cooperative and training-event links reference
          existing records.
        </p>
      </div>
      {linksResult.ok ? (
        <CalendarActivityForm links={linksResult.data} />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load calendar link options.
        </p>
      )}
    </div>
  );
}
