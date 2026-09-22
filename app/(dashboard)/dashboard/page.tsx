import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const kpis = [
  "Total Cooperatives",
  "Ongoing Registrations",
  "Technical Assistance",
  "Trainings Conducted",
  "Cooperative Orientations",
  "Total Membership",
] as const;

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Summary figures will be queried from PostgreSQL in M10. Placeholders below
          are not live counts.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((label) => (
            <article
              key={label}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h2 className="text-sm font-medium text-slate-500">{label}</h2>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-300">
                —
              </p>
              <p className="mt-1 text-xs text-slate-400">Awaiting database data</p>
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
