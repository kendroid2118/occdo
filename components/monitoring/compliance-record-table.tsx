import Link from "next/link";

import type { ComplianceRecord } from "@/lib/actions/compliance-records";

type ComplianceRecordTableProps = {
  items: ComplianceRecord[];
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

export function ComplianceRecordTable({ items }: ComplianceRecordTableProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No compliance records match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Period</th>
            <th className="px-4 py-3 font-medium">Cooperative</th>
            <th className="px-4 py-3 font-medium">Requirement</th>
            <th className="px-4 py-3 font-medium">Due</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 text-slate-700">{row.reportingPeriod}</td>
              <td className="px-4 py-3 text-slate-800">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/cooperatives/${row.cooperative.id}`}
                >
                  {row.cooperative.name}
                </Link>
                <p className="text-xs text-slate-500">{row.cooperative.cooperativeCode}</p>
              </td>
              <td className="px-4 py-3 text-slate-700">{row.requirement.name}</td>
              <td className="px-4 py-3 text-slate-700">{formatDate(row.dueDate)}</td>
              <td className="px-4 py-3">
                <Link
                  className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
                  href={`/monitoring/${row.id}`}
                >
                  {row.status.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
