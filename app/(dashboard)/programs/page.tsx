import type { Metadata } from "next";
import Link from "next/link";

import { DeliveryFilters } from "@/components/programs/delivery-filters";
import { DeliveryPagination } from "@/components/programs/delivery-pagination";
import { DeliveryTable } from "@/components/programs/delivery-table";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { listProgramCatalogsAction } from "@/lib/actions/programs";
import { listServiceDeliveriesAction } from "@/lib/actions/service-deliveries";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { SERVICE_DELIVERY_ACTION_ERROR_MESSAGE } from "@/lib/programs/delivery-errors";
import { listServiceDeliveriesSchema } from "@/lib/validation/service-delivery";

export const metadata: Metadata = {
  title: "Programs & Services",
};

type ProgramsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams;
  const parsedQuery = listServiceDeliveriesSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    cooperativeId: firstParam(params.cooperativeId),
    serviceTypeId: firstParam(params.serviceTypeId),
    deliveredFrom: firstParam(params.deliveredFrom),
    deliveredTo: firstParam(params.deliveredTo),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const [catalogsResult, cooperativesResult] = await Promise.all([
    listProgramCatalogsAction({}),
    listCooperativesAction({ page: 1, pageSize: 50 }),
  ]);
  const listResult = parsedQuery.success
    ? await listServiceDeliveriesAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Services availed</h2>
          <p className="mt-1 text-sm text-slate-600">
            Service types and programs come from the database. Each record is linked to a
            cooperative.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/programs/new"
          >
            Record delivery
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success ||
      !listResult.ok ||
      !catalogsResult.ok ||
      !cooperativesResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {catalogsResult.ok && cooperativesResult.ok
            ? SERVICE_DELIVERY_ACTION_ERROR_MESSAGE[
                parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
              ]
            : "Could not load catalogs or cooperatives."}
        </p>
      ) : (
        <>
          <DeliveryFilters
            catalogs={catalogsResult.data}
            cooperatives={cooperativesResult.data.items}
            values={parsedQuery.data}
          />
          <DeliveryTable items={listResult.data.items} />
          <DeliveryPagination
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
