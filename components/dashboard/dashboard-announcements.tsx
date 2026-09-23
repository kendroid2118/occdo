import { DashboardEmptyPanel } from "@/components/dashboard/dashboard-empty-panel";
import type { AnnouncementRecord } from "@/lib/actions/announcements";
import { utcToManilaDateTimeLocal } from "@/lib/calendar/manila-datetime";

type DashboardAnnouncementsProps = {
  items: AnnouncementRecord[];
};

function manilaDateTimeLabel(value: Date | string): string {
  return utcToManilaDateTimeLocal(value instanceof Date ? value : new Date(value)).replace("T", " ");
}

export function DashboardAnnouncements({ items }: DashboardAnnouncementsProps) {
  if (items.length === 0) {
    return (
      <DashboardEmptyPanel message="No announcements are listed yet." title="Announcements" />
    );
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">Announcements</h2>
      <ul className="mt-3 space-y-3">
        {items.map((row) => (
          <li className="border-b border-slate-100 pb-3 last:border-0 last:pb-0" key={row.id}>
            <h3 className="text-sm font-medium text-slate-900">{row.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {manilaDateTimeLabel(row.publishedAt)}
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{row.body}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}
