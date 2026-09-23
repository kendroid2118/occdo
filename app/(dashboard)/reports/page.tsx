import type { Metadata } from "next";

import { CooperativeReportTable } from "@/components/reports/cooperative-report-table";
import { MembershipReportTables } from "@/components/reports/membership-report-tables";
import { ReportActiveFilters } from "@/components/reports/report-active-filters";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportPagination } from "@/components/reports/report-pagination";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import {
  getCooperativeReportAction,
  getMembershipReportAction,
  listReportCooperativeOptionsAction,
} from "@/lib/actions/reports";
import { REPORT_ACTION_ERROR_MESSAGE } from "@/lib/reports/form-errors";
import { reportFiltersSchema } from "@/lib/validation/reports";

export const metadata: Metadata = {
  title: "Reports",
};

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const parsedQuery = reportFiltersSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    dateFrom: firstParam(params.dateFrom),
    dateTo: firstParam(params.dateTo),
    cooperativeId: firstParam(params.cooperativeId),
    typeId: firstParam(params.typeId),
    sectorId: firstParam(params.sectorId),
    barangayId: firstParam(params.barangayId),
    statusId: firstParam(params.statusId),
    accreditationStatusId: firstParam(params.accreditationStatusId),
  });

  const [catalogsResult, cooperativesResult] = await Promise.all([
    listCooperativeCatalogsAction({}),
    listReportCooperativeOptionsAction({}),
  ]);

  const cooperativeReport = parsedQuery.success
    ? await getCooperativeReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const membershipReport = parsedQuery.success
    ? await getMembershipReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const reportErrorCode = !cooperativeReport.ok
    ? cooperativeReport.code
    : !membershipReport.ok
      ? membershipReport.code
      : null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-600">
          Cooperative and membership reports use live PostgreSQL records. Dates use the Philippine
          calendar (Asia/Manila).
        </p>
      </div>

      {!catalogsResult.ok || !cooperativesResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          Could not load report catalogs.
        </p>
      ) : (
        <>
          <ReportFilters
            catalogs={catalogsResult.data}
            cooperatives={cooperativesResult.data}
            values={parsedQuery.success ? parsedQuery.data : { page: 1, pageSize: 20 }}
          />
          {parsedQuery.success ? (
            <ReportActiveFilters
              catalogs={catalogsResult.data}
              cooperatives={cooperativesResult.data}
              values={parsedQuery.data}
            />
          ) : (
            <p className="text-sm text-red-700" role="alert">
              {REPORT_ACTION_ERROR_MESSAGE.VALIDATION}
            </p>
          )}

          {parsedQuery.success && cooperativeReport.ok && membershipReport.ok ? (
            <>
              <section aria-labelledby="cooperative-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="cooperative-report-heading">
                  Cooperative report
                </h3>
                <CooperativeReportTable report={cooperativeReport.data} />
                <ReportPagination
                  label="cooperatives"
                  page={cooperativeReport.data.page}
                  pageSize={cooperativeReport.data.pageSize}
                  total={cooperativeReport.data.total}
                  values={parsedQuery.data}
                />
              </section>

              <section aria-labelledby="membership-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="membership-report-heading">
                  Membership report
                </h3>
                <MembershipReportTables report={membershipReport.data} />
                <ReportPagination
                  label="current membership rows"
                  page={membershipReport.data.current.page}
                  pageSize={membershipReport.data.current.pageSize}
                  total={membershipReport.data.current.total}
                  values={parsedQuery.data}
                />
              </section>
            </>
          ) : parsedQuery.success && reportErrorCode ? (
            <p className="text-sm text-red-700" role="alert">
              {REPORT_ACTION_ERROR_MESSAGE[reportErrorCode]}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
