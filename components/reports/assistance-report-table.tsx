import type { AssistanceReport } from "@/lib/actions/reports";

type AssistanceReportTableProps = {
  report: AssistanceReport;
};

export function AssistanceReportTable({ report }: AssistanceReportTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Requested (workflow)</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.requestedTotal}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Disbursed (ledger)</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.disbursed}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Adjustments</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.adjustments}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Recovered</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.recovered}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Net ledger</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.net}</p>
        </article>
      </div>
      <p className="text-sm text-slate-600">
        Requested amounts come from assistance records. Disbursed, adjustment, recovery, and net
        totals come only from the fund ledger.
      </p>
      {report.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          No assistance records match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Assistance workflow report</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Requested</th>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Cooperative</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Requested amount</th>
                <th className="px-4 py-3 font-medium">Released</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="px-4 py-3 text-slate-700">{row.requestedAt}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
                  <td className="px-4 py-3 text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.assistanceType.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.status.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.requestedAmount}</td>
                  <td className="px-4 py-3 text-slate-700">{row.releasedAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
