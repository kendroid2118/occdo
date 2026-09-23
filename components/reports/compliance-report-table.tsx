import type { ComplianceReport } from "@/lib/actions/reports";

type ComplianceReportTableProps = {
  report: ComplianceReport;
};

export function ComplianceReportTable({ report }: ComplianceReportTableProps) {
  return (
    <div className="space-y-4">
      {report.byStatus.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {report.byStatus.map((row) => (
            <article className="rounded-lg border border-slate-200 bg-white p-4" key={row.status.id}>
              <h4 className="text-sm font-medium text-slate-600">{row.status.name}</h4>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{row.count}</p>
            </article>
          ))}
        </div>
      ) : null}
      {report.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          No compliance records match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Compliance report</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Cooperative</th>
                <th className="px-4 py-3 font-medium">Requirement</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="px-4 py-3 text-slate-700">{row.dueDate}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
                  <td className="px-4 py-3 text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {row.requirement.name}
                    {row.requirement.isActive ? "" : " (inactive)"}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.reportingPeriod}</td>
                  <td className="px-4 py-3 text-slate-700">{row.status.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.submittedDate ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
