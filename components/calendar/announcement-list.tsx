import type { AnnouncementRecord } from "@/lib/actions/announcements";
import { utcToManilaDateTimeLocal } from "@/lib/calendar/manila-datetime";

type AnnouncementListProps = {
  items: AnnouncementRecord[];
};

function manilaDateTimeLabel(value: Date | string): string {
  return utcToManilaDateTimeLocal(value instanceof Date ? value : new Date(value)).replace("T", " ");
}

export function AnnouncementList({ items }: AnnouncementListProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No published announcements.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((row) => (
        <li className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={row.id}>
          <h3 className="text-sm font-semibold text-slate-900">{row.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            Published {manilaDateTimeLabel(row.publishedAt)}
            {row.expiresAt ? ` · Expires ${manilaDateTimeLabel(row.expiresAt)}` : ""}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{row.body}</p>
        </li>
      ))}
    </ul>
  );
}
