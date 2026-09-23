import type { DashboardKpis } from "@/lib/actions/dashboard";

const kpiItems = [
  ["totalCooperatives", "Total Cooperatives"],
  ["ongoingRegistrations", "Ongoing Registrations"],
  ["technicalAssistance", "Technical Assistance"],
  ["trainingsConducted", "Trainings Conducted"],
  ["cooperativeOrientations", "Cooperative Orientations"],
  ["totalMembership", "Total Membership"],
] as const;

type DashboardKpiCardsProps = {
  kpis: DashboardKpis;
  year: number;
};

export function DashboardKpiCards({ kpis, year }: DashboardKpiCardsProps) {
  return (
    <section aria-labelledby="dashboard-kpis-heading">
      <h2 className="sr-only" id="dashboard-kpis-heading">
        Key figures
      </h2>
      <p className="max-w-2xl text-sm leading-6 text-slate-600">
        Figures are counted from PostgreSQL for calendar year {year}. Empty catalogs show
        zeros.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiItems.map(([key, label]) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={key}
          >
            <h3 className="text-sm font-medium text-slate-500">{label}</h3>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              {kpis[key].toLocaleString("en-PH")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
