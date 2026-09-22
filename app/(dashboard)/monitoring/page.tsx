import type { Metadata } from "next";
import Link from "next/link";

import { ComplianceRecordFilters } from "@/components/monitoring/compliance-record-filters";
import { ComplianceRecordPagination } from "@/components/monitoring/compliance-record-pagination";
import { ComplianceRecordTable } from "@/components/monitoring/compliance-record-table";
import {
  listComplianceCatalogsAction,
  listComplianceRecordsAction,
} from "@/lib/actions/compliance-records";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { COMPLIANCE_ACTION_ERROR_MESSAGE } from "@/lib/compliance/errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listComplianceRecordsSchema } from "@/lib/validation/compliance-record";

export const metadata: Metadata = {
  title: "Monitoring & Compliance",
};

type MonitoringPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MonitoringPage({ searchParams }: MonitoringPageProps) {
  const params = await searchParams;
  const parsedQuery = listComplianceRecordsSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    cooperativeId: firstParam(params.cooperativeId),
    requirementId: firstParam(params.requirementId),
    statusId: firstParam(params.statusId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const [catalogsResult, cooperativesResult] = await Promise.all([
    listComplianceCatalogsAction({}),
    listCooperativesAction({ page: 1, pageSize: 50 }),
  ]);
  const listResult = parsedQuery.success
    ? await listComplianceRecordsAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Compliance records</h2>
          <p className="mt-1 text-sm text-slate-600">
            Requirements come from the database. New records use active requirements only.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/monitoring/new"
          >
            Create record
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success ||
      !listResult.ok ||
      !catalogsResult.ok ||
      !cooperativesResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok && cooperativesResult.ok
            ? COMPLIANCE_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load catalogs or cooperatives."}
        </p>
      ) : (
        <>
          <ComplianceRecordFilters
            catalogs={catalogsResult.data}
            cooperatives={cooperativesResult.data.items}
            values={parsedQuery.data}
          />
          <ComplianceRecordTable items={listResult.data.items} />
          <ComplianceRecordPagination
            page={listResult.data.page}
            pageSize={listResult.data.pageSize}
            total={listResult.data.total}
            values={parsedQuery.data}
          />
        </>
      )}
    </div>
  );
}
