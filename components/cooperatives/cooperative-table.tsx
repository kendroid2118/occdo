import Link from "next/link";

import type { CooperativeRecord } from "@/lib/actions/cooperatives";

type CooperativeTableProps = {
  items: CooperativeRecord[];
  canWrite: boolean;
};

export function CooperativeTable({ items, canWrite }: CooperativeTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No cooperatives match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Sector</th>
            <th className="px-4 py-3 font-medium">Barangay</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Members</th>
            {canWrite ? <th className="px-4 py-3 font-medium">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
              <td className="px-4 py-3 text-slate-800">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/cooperatives/${row.id}`}
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.type.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.sector.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.barangay.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.status.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.totalMembers}</td>
              {canWrite ? (
                <td className="px-4 py-3">
                  <Link
                    className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                    href={`/cooperatives/${row.id}/edit`}
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
