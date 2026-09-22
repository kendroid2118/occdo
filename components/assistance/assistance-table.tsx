import Link from "next/link";

import type { AssistanceRecord } from "@/lib/actions/assistance";

type AssistanceTableProps = {
  items: AssistanceRecord[];
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

export function AssistanceTable({ items }: AssistanceTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No assistance records match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Requested</th>
            <th className="px-4 py-3 font-medium">Cooperative</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Fund source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 text-slate-700">{formatDate(row.requestedAt)}</td>
              <td className="px-4 py-3 text-slate-800">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/cooperatives/${row.cooperative.id}`}
                >
                  {row.cooperative.name}
                </Link>
                <p className="text-xs text-slate-500">{row.cooperative.cooperativeCode}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.assistanceType.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.amount}</td>
              <td className="px-4 py-3">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/financial-assistance/${row.id}`}
                >
                  {row.status.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.fundSource ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
