import type { Metadata } from "next";

import { AssistanceReportTable } from "@/components/reports/assistance-report-table";
import { ComplianceReportTable } from "@/components/reports/compliance-report-table";
import { CooperativeReportTable } from "@/components/reports/cooperative-report-table";
import { MembershipReportTables } from "@/components/reports/membership-report-tables";
import { ReportActiveFilters } from "@/components/reports/report-active-filters";
import { ReportFilters } from "@/components/reports/report-filters";
import { ReportPagination } from "@/components/reports/report-pagination";
import { SummaryReportCards } from "@/components/reports/summary-report-cards";
import { TrainingReportTable } from "@/components/reports/training-report-table";
import {
  getAssistanceReportAction,
  getComplianceReportAction,
  getCooperativeReportAction,
  getMembershipReportAction,
  getSummaryReportAction,
  getTrainingReportAction,
  listReportCatalogsAction,
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
    assistanceTypeId: firstParam(params.assistanceTypeId),
    programId: firstParam(params.programId),
    serviceTypeId: firstParam(params.serviceTypeId),
    trainingKind: firstParam(params.trainingKind),
    complianceStatusId: firstParam(params.complianceStatusId),
    complianceRequirementId: firstParam(params.complianceRequirementId),
  });

  const [catalogsResult, cooperativesResult] = await Promise.all([
    listReportCatalogsAction({}),
    listReportCooperativeOptionsAction({}),
  ]);

  const cooperativeReport = parsedQuery.success
    ? await getCooperativeReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const membershipReport = parsedQuery.success
    ? await getMembershipReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const assistanceReport = parsedQuery.success
    ? await getAssistanceReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const trainingReport = parsedQuery.success
    ? await getTrainingReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const complianceReport = parsedQuery.success
    ? await getComplianceReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };
  const summaryReport = parsedQuery.success
    ? await getSummaryReportAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  const reportErrorCode = !cooperativeReport.ok
    ? cooperativeReport.code
    : !membershipReport.ok
      ? membershipReport.code
      : !assistanceReport.ok
        ? assistanceReport.code
        : !trainingReport.ok
          ? trainingReport.code
          : !complianceReport.ok
            ? complianceReport.code
            : !summaryReport.ok
              ? summaryReport.code
              : null;

  const reportsReady =
    parsedQuery.success &&
    cooperativeReport.ok &&
    membershipReport.ok &&
    assistanceReport.ok &&
    trainingReport.ok &&
    complianceReport.ok &&
    summaryReport.ok;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-600">
          Operational reports use live PostgreSQL records. Dates use the Philippine calendar
          (Asia/Manila).
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

          {reportsReady ? (
            <>
              <section aria-labelledby="summary-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="summary-report-heading">
                  Summary report
                </h3>
                <SummaryReportCards report={summaryReport.data} />
              </section>

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

              <section aria-labelledby="assistance-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="assistance-report-heading">
                  Assistance report
                </h3>
                <AssistanceReportTable report={assistanceReport.data} />
                <ReportPagination
                  label="assistance records"
                  page={assistanceReport.data.page}
                  pageSize={assistanceReport.data.pageSize}
                  total={assistanceReport.data.total}
                  values={parsedQuery.data}
                />
              </section>

              <section aria-labelledby="training-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="training-report-heading">
                  Training report
                </h3>
                <TrainingReportTable report={trainingReport.data} />
                <ReportPagination
                  label="training events"
                  page={trainingReport.data.page}
                  pageSize={trainingReport.data.pageSize}
                  total={trainingReport.data.total}
                  values={parsedQuery.data}
                />
              </section>

              <section aria-labelledby="compliance-report-heading" className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900" id="compliance-report-heading">
                  Compliance report
                </h3>
                <ComplianceReportTable report={complianceReport.data} />
                <ReportPagination
                  label="compliance records"
                  page={complianceReport.data.page}
                  pageSize={complianceReport.data.pageSize}
                  total={complianceReport.data.total}
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
