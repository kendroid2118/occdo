import type { Metadata } from "next";
import Link from "next/link";

import { AssistanceFilters } from "@/components/assistance/assistance-filters";
import { AssistancePagination } from "@/components/assistance/assistance-pagination";
import { AssistanceTable } from "@/components/assistance/assistance-table";
import {
  listAssistanceCatalogsAction,
  listAssistanceRecordsAction,
} from "@/lib/actions/assistance";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { ASSISTANCE_ACTION_ERROR_MESSAGE } from "@/lib/assistance/errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listAssistanceRecordsSchema } from "@/lib/validation/assistance";

export const metadata: Metadata = {
  title: "Financial Assistance",
};

type AssistancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FinancialAssistancePage({
  searchParams,
}: AssistancePageProps) {
  const params = await searchParams;
  const parsedQuery = listAssistanceRecordsSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    cooperativeId: firstParam(params.cooperativeId),
    assistanceTypeId: firstParam(params.assistanceTypeId),
    statusId: firstParam(params.statusId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const [catalogsResult, cooperativesResult] = await Promise.all([
    listAssistanceCatalogsAction({}),
    listCooperativesAction({ page: 1, pageSize: 50 }),
  ]);
  const listResult = parsedQuery.success
    ? await listAssistanceRecordsAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Assistance records</h2>
          <p className="mt-1 text-sm text-slate-600">
            Assistance types and statuses come from the database. Amount and status changes are
            audited.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/financial-assistance/new"
          >
            Record assistance
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success ||
      !listResult.ok ||
      !catalogsResult.ok ||
      !cooperativesResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok && cooperativesResult.ok
            ? ASSISTANCE_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load catalogs or cooperatives."}
        </p>
      ) : (
        <>
          <AssistanceFilters
            catalogs={catalogsResult.data}
            cooperatives={cooperativesResult.data.items}
            values={parsedQuery.data}
          />
          <AssistanceTable items={listResult.data.items} />
          <AssistancePagination
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
