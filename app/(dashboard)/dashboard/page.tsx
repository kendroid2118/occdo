import type { Metadata } from "next";

import { DashboardBarList } from "@/components/dashboard/dashboard-bar-list";
import { DashboardCdaCard } from "@/components/dashboard/dashboard-cda-card";
import { DashboardEmptyPanel } from "@/components/dashboard/dashboard-empty-panel";
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards";
import { getDashboardSummaryAction } from "@/lib/actions/dashboard";
import { getCdaPortalUrl } from "@/lib/dashboard/cda-portal";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const cdaPortalUrl = getCdaPortalUrl();
  const result = await getDashboardSummaryAction({});

  return (
    <div className="space-y-8">
      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          Could not load dashboard totals.
        </p>
      ) : (
        <>
          <DashboardKpiCards kpis={result.data.kpis} year={result.data.year} />

          <section
            aria-labelledby="dashboard-breakdowns-heading"
            className="grid gap-4 lg:grid-cols-2"
          >
            <h2 className="sr-only" id="dashboard-breakdowns-heading">
              Cooperative and program breakdowns
            </h2>
            <DashboardBarList
              description="Counts use maintainable sector records from PostgreSQL."
              emptyLabel="No cooperative sectors are configured."
              items={result.data.cooperativesBySector}
              title="Cooperatives by Sector"
              unitLabel="cooperatives"
            />
            <DashboardBarList
              emptyLabel="No cooperative types are configured."
              items={result.data.cooperativesByType}
              title="Cooperatives by Type"
              unitLabel="cooperatives"
            />
            <DashboardBarList
              emptyLabel="No cooperative statuses are configured."
              items={result.data.cooperativesByStatus}
              title="Cooperatives by Status"
              unitLabel="cooperatives"
            />
            <DashboardBarList
              description="Open compliance records by maintainable status."
              emptyLabel="No compliance statuses are configured."
              items={result.data.complianceByStatus}
              title="Compliance status"
              unitLabel="records"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Programs &amp; services YTD
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Service deliveries recorded in {result.data.year}.
              </p>
              <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                {result.data.ytdDeliveries.toLocaleString("en-PH")}
              </p>
            </article>
            <DashboardCdaCard url={cdaPortalUrl} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <DashboardEmptyPanel
              message="No upcoming activities are listed yet. Calendar records will appear here when that module is available."
              title="Upcoming activities"
            />
            <DashboardEmptyPanel
              message="No announcements are listed yet."
              title="Announcements"
            />
          </section>
        </>
      )}
    </div>
  );
}
