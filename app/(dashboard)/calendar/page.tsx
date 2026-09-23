import type { Metadata } from "next";
import Link from "next/link";

import { CalendarMonthList } from "@/components/calendar/calendar-month-list";
import { listCalendarActivitiesAction } from "@/lib/actions/calendar";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { CALENDAR_ACTION_ERROR_MESSAGE } from "@/lib/calendar/form-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listCalendarActivitiesSchema } from "@/lib/validation/calendar";

export const metadata: Metadata = {
  title: "Calendar",
};

type CalendarPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function monthHref(year: number, month: number): string {
  return `/calendar?year=${year}&month=${month}`;
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const parsed = listCalendarActivitiesSchema.safeParse({
    year: firstParam(params.year),
    month: firstParam(params.month),
    kind: firstParam(params.kind),
    cooperativeId: firstParam(params.cooperativeId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const listResult = parsed.success
    ? await listCalendarActivitiesAction(parsed.data)
    : { ok: false as const, code: "VALIDATION" as const };

  const year = listResult.ok ? listResult.data.year : undefined;
  const month = listResult.ok ? listResult.data.month : undefined;
  const previous = year && month ? shiftMonth(year, month, -1) : null;
  const next = year && month ? shiftMonth(year, month, 1) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Calendar</h2>
          <p className="mt-1 text-sm text-slate-600">
            Office activities, trainings, and deadlines. Times use Asia/Manila.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/calendar/new"
          >
            New activity
          </Link>
        ) : null}
      </div>

      {!parsed.success || !listResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {CALENDAR_ACTION_ERROR_MESSAGE[parsed.success && !listResult.ok ? listResult.code : "VALIDATION"]}
        </p>
      ) : (
        <>
          <nav aria-label="Calendar month" className="flex items-center justify-between text-sm">
            {previous ? (
              <Link
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
                href={monthHref(previous.year, previous.month)}
              >
                Previous month
              </Link>
            ) : (
              <span />
            )}
            <p className="font-medium text-slate-800">
              {new Date(Date.UTC(listResult.data.year, listResult.data.month - 1, 1)).toLocaleString(
                "en-PH",
                { month: "long", year: "numeric", timeZone: "UTC" },
              )}
            </p>
            {next ? (
              <Link
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-800 hover:bg-slate-50"
                href={monthHref(next.year, next.month)}
              >
                Next month
              </Link>
            ) : (
              <span />
            )}
          </nav>
          <CalendarMonthList canWrite={canWrite} items={listResult.data.items} />
        </>
      )}
    </div>
  );
}
