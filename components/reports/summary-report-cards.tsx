import type { SummaryReport } from "@/lib/actions/reports";

type SummaryReportCardsProps = {
  report: SummaryReport;
};

export function SummaryReportCards({ report }: SummaryReportCardsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Cooperatives</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.cooperatives.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Current members</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.membership.totalMembers.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Assistance records</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.assistanceRecords.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Ledger net</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.net}</p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Training events</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.trainingEvents.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Present participants</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.trainingAttendance.PRESENT.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Compliance records</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.complianceRecords.toLocaleString("en-PH")}
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Ledger disbursed</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{report.ledger.disbursed}</p>
        </article>
      </div>
      <p className="text-sm text-slate-600">
        Summary figures are live PostgreSQL aggregates. Financial totals use fund-ledger Decimals,
        not requested assistance amounts.
      </p>
    </div>
  );
}
