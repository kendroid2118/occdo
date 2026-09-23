import type { TrainingReport } from "@/lib/actions/reports";

type TrainingReportTableProps = {
  report: TrainingReport;
};

const KIND_LABEL: Record<string, string> = {
  TRAINING: "Training",
  SEMINAR: "Seminar",
  ORIENTATION: "Orientation",
};

export function TrainingReportTable({ report }: TrainingReportTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {report.byKind.map((row) => (
          <article className="rounded-lg border border-slate-200 bg-white p-4" key={row.kind}>
            <h4 className="text-sm font-medium text-slate-600">{KIND_LABEL[row.kind] ?? row.kind}</h4>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{row.count}</p>
          </article>
        ))}
        <article className="rounded-lg border border-slate-200 bg-white p-4">
          <h4 className="text-sm font-medium text-slate-600">Present / absent / registered</h4>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {report.attendance.PRESENT} / {report.attendance.ABSENT} / {report.attendance.REGISTERED}
          </p>
        </article>
      </div>
      {report.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600">
          No training events match these filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <caption className="sr-only">Training and capacity-building report</caption>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">Program</th>
                <th className="px-4 py-3 font-medium">Present</th>
                <th className="px-4 py-3 font-medium">Absent</th>
                <th className="px-4 py-3 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="px-4 py-3 text-slate-700">{row.startAt}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                  <td className="px-4 py-3 text-slate-700">{KIND_LABEL[row.kind] ?? row.kind}</td>
                  <td className="px-4 py-3 text-slate-700">{row.venue}</td>
                  <td className="px-4 py-3 text-slate-700">{row.program?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.attendance.PRESENT}</td>
                  <td className="px-4 py-3 text-slate-700">{row.attendance.ABSENT}</td>
                  <td className="px-4 py-3 text-slate-700">{row.attendance.REGISTERED}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
