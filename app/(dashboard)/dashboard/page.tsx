import type { Metadata } from "next";

import { getDashboardSummaryAction } from "@/lib/actions/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

const kpiLabels = [
  ["totalCooperatives", "Total Cooperatives"],
  ["ongoingRegistrations", "Ongoing Registrations"],
  ["technicalAssistance", "Technical Assistance"],
  ["trainingsConducted", "Trainings Conducted"],
  ["cooperativeOrientations", "Cooperative Orientations"],
  ["totalMembership", "Total Membership"],
] as const;

export default async function DashboardPage() {
  const result = await getDashboardSummaryAction({});
  const kpis = result.ok ? result.data.kpis : null;

  return (
    <div className="space-y-8">
      <section>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Summary figures are counted from PostgreSQL. Empty catalogs show zeros.
        </p>
        {!result.ok ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            Could not load dashboard totals.
          </p>
        ) : null}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpiLabels.map(([key, label]) => (
            <article
              key={key}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h2 className="text-sm font-medium text-slate-500">{label}</h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {kpis ? kpis[key] : "—"}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Cooperatives by Sector</h2>
          <p className="mt-2 text-sm text-slate-500">
            Chart will use maintainable sector records (initial five) once cooperatives
            exist.
          </p>
        </article>
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">CDA Portal</h2>
          <p className="mt-2 text-sm text-slate-500">
            External shortcut only. The URL will be set in system configuration (M13).
            No CDA integration in this release.
          </p>
        </article>
      </section>
    </div>
  );
}
