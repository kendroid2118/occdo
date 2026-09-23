import type { MembershipReport } from "@/lib/actions/reports";

type MembershipReportTablesProps = {
  report: MembershipReport;
};

export function MembershipReportTables({ report }: MembershipReportTablesProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-600">Cooperatives</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.current.totals.cooperatives.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-600">Current total members</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.current.totals.totalMembers.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-600">Current male members</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.current.totals.maleMembers.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-medium text-slate-600">Current female members</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.current.totals.femaleMembers.toLocaleString("en-PH")}
          </p>
        </article>
      </div>
      <p className="text-sm text-slate-600">
        Male and female counts are shown separately and are not assumed to equal the total.
      </p>

      {report.current.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          No current membership rows match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Current membership from cooperative records</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Male</th>
                <th className="px-4 py-3 font-medium">Female</th>
              </tr>
            </thead>
            <tbody>
              {report.current.items.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.cooperativeId}>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
                  <td className="px-4 py-3 text-slate-800">{row.name}</td>
                  <td className="px-4 py-3 text-slate-700">{row.totalMembers}</td>
                  <td className="px-4 py-3 text-slate-700">{row.maleMembers}</td>
                  <td className="px-4 py-3 text-slate-700">{row.femaleMembers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section aria-labelledby="membership-history-heading" className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900" id="membership-history-heading">
          Membership snapshots
        </h3>
        {!report.filters.dateFrom || !report.filters.dateTo ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
            Choose a date range to list historical membership snapshots. Current totals above stay
            on live cooperative fields.
          </p>
        ) : report.historical.items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
            No membership snapshots fall in this Asia/Manila date range.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <caption className="sr-only">Historical membership snapshots</caption>
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">As of</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Male</th>
                  <th className="px-4 py-3 font-medium">Female</th>
                </tr>
              </thead>
              <tbody>
                {report.historical.items.map((row) => (
                  <tr
                    className="border-b border-slate-100 last:border-0"
                    key={`${row.cooperativeId}-${row.asOfDate}`}
                  >
                    <td className="px-4 py-3 text-slate-700">{row.asOfDate}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.cooperativeCode}</td>
                    <td className="px-4 py-3 text-slate-800">{row.name}</td>
                    <td className="px-4 py-3 text-slate-700">{row.totalMembers}</td>
                    <td className="px-4 py-3 text-slate-700">{row.maleMembers}</td>
                    <td className="px-4 py-3 text-slate-700">{row.femaleMembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
