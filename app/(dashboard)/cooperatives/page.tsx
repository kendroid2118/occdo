import type { Metadata } from "next";
import Link from "next/link";

import { CooperativeFilters } from "@/components/cooperatives/cooperative-filters";
import { CooperativePagination } from "@/components/cooperatives/cooperative-pagination";
import { CooperativeTable } from "@/components/cooperatives/cooperative-table";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { COOPERATIVE_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/form-errors";
import { listCooperativesSchema } from "@/lib/validation/cooperative";

export const metadata: Metadata = {
  title: "Cooperatives",
};

type CooperativesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CooperativesPage({ searchParams }: CooperativesPageProps) {
  const params = await searchParams;
  const parsedQuery = listCooperativesSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    search: firstParam(params.search),
    typeId: firstParam(params.typeId),
    sectorId: firstParam(params.sectorId),
    barangayId: firstParam(params.barangayId),
    statusId: firstParam(params.statusId),
    accreditationStatusId: firstParam(params.accreditationStatusId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const catalogsResult = await listCooperativeCatalogsAction({});
  const listResult = parsedQuery.success
    ? await listCooperativesAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Cooperative masterlist</h2>
          <p className="mt-1 text-sm text-slate-600">
            Names and classifications come from the database.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/cooperatives/new"
          >
            New cooperative
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success || !listResult.ok || !catalogsResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok
            ? COOPERATIVE_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load reference catalogs."}
        </p>
      ) : (
        <>
          <CooperativeFilters catalogs={catalogsResult.data} values={parsedQuery.data} />
          <CooperativeTable canWrite={canWrite} items={listResult.data.items} />
          <CooperativePagination
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
