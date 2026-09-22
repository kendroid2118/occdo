import Link from "next/link";

import type { TrainingEventRecord } from "@/lib/actions/training-events";
import { TRAINING_KIND_LABEL } from "@/lib/capacity-building/training-errors";

type TrainingEventTableProps = {
  items: TrainingEventRecord[];
  canWrite: boolean;
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

export function TrainingEventTable({ items, canWrite }: TrainingEventTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No training events match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Kind</th>
            <th className="px-4 py-3 font-medium">Start</th>
            <th className="px-4 py-3 font-medium">Venue</th>
            {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                <Link
                  className="text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/capacity-building/${row.id}`}
                >
                  {row.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">
                {TRAINING_KIND_LABEL[row.kind] ?? row.kind}
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(row.startAt)}</td>
              <td className="px-4 py-3 text-slate-700">{row.venue}</td>
              {canWrite ? (
                <td className="px-4 py-3">
                  <Link
                    className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                    href={`/capacity-building/${row.id}/edit`}
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
