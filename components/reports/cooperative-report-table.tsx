import type { CooperativeReport } from "@/lib/actions/reports";

type CooperativeReportTableProps = {
  report: CooperativeReport;
};

export function CooperativeReportTable({ report }: CooperativeReportTableProps) {
  if (report.items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
        No cooperatives match these filters.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Cooperative report</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Sector</th>
            <th className="px-4 py-3 font-medium">Barangay</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Accreditation</th>
            <th className="px-4 py-3 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody>
          {report.items.map((row) => (
            <tr className="border-b border-slate-100 last:border-0" key={row.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
              <td className="px-4 py-3 text-slate-800">{row.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.type.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.sector.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.barangay.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.status.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.accreditationStatus.name}</td>
              <td className="px-4 py-3 text-slate-700">{row.dateRegistered ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
