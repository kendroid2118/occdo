import Link from "next/link";

import type { CooperativeTrainingEventRecord } from "@/lib/actions/training-participants";
import { TRAINING_KIND_LABEL } from "@/lib/capacity-building/training-errors";

type CooperativeTrainingEventsProps = {
  events: CooperativeTrainingEventRecord[];
};

function formatDate(value: Date | string | null): string {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

export function CooperativeTrainingEvents({ events }: CooperativeTrainingEventsProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Training events</h3>

      {events.length === 0 ? (
        <p className="text-sm text-slate-600">
          No training events recorded for this cooperative.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 pr-3 font-medium">Title</th>
                <th className="py-2 pr-3 font-medium">Kind</th>
                <th className="py-2 pr-3 font-medium">Start</th>
                <th className="py-2 font-medium">Venue</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr className="border-b border-slate-100 last:border-0" key={event.id}>
                  <td className="py-2 pr-3 font-medium text-slate-900">
                    <Link
                      className="text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                      href={`/capacity-building/${event.id}`}
                    >
                      {event.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-slate-700">
                    {TRAINING_KIND_LABEL[event.kind] ?? event.kind}
                  </td>
                  <td className="py-2 pr-3 text-slate-700">{formatDate(event.startAt)}</td>
                  <td className="py-2 text-slate-700">{event.venue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
