import Link from "next/link";

import type { CalendarActivityRecord } from "@/lib/actions/calendar";
import { utcToManilaDateTimeLocal } from "@/lib/calendar/manila-datetime";
import { CALENDAR_KIND_LABEL } from "@/lib/calendar/form-errors";

type CalendarMonthListProps = {
  items: CalendarActivityRecord[];
  canWrite: boolean;
};

export function CalendarMonthList({ items, canWrite }: CalendarMonthListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No calendar activities in this month.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Calendar activities</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Start</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Cooperative</th>
            {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 text-slate-700">
                {utcToManilaDateTimeLocal(new Date(row.startAt)).replace("T", " ")}
              </td>
              <td className="px-4 py-3 text-slate-700">{CALENDAR_KIND_LABEL[row.kind]}</td>
              <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
              <td className="px-4 py-3 text-slate-700">{row.location ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">{row.cooperative?.name ?? "—"}</td>
              {canWrite ? (
                <td className="px-4 py-3">
                  <Link
                    className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                    href={`/calendar/${row.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
