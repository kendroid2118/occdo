import type { Metadata } from "next";
import Link from "next/link";

import { AccreditationFilters } from "@/components/cooperatives/accreditation-filters";
import { AccreditationPagination } from "@/components/cooperatives/accreditation-pagination";
import { AccreditationTable } from "@/components/cooperatives/accreditation-table";
import { listAccreditationCasesAction } from "@/lib/actions/accreditation";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { ACCREDITATION_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/accreditation-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listAccreditationCasesSchema } from "@/lib/validation/accreditation";

export const metadata: Metadata = {
  title: "Registration / Accreditation",
};

type CasesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccreditationCasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const parsedQuery = listAccreditationCasesSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    statusId: firstParam(params.statusId),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const catalogsResult = await listCooperativeCatalogsAction({});
  const listResult = parsedQuery.success
    ? await listAccreditationCasesAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Registration / Accreditation
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Case types and statuses come from the database. Each case is linked to a
            cooperative.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/cooperatives/cases/new"
          >
            File case
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success || !listResult.ok || !catalogsResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok
            ? ACCREDITATION_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load reference catalogs."}
        </p>
      ) : (
        <>
          <AccreditationFilters catalogs={catalogsResult.data} values={parsedQuery.data} />
          <AccreditationTable items={listResult.data.items} />
          <AccreditationPagination
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
