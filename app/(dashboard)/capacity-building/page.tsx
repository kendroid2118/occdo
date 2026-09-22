import type { Metadata } from "next";
import Link from "next/link";

import { TrainingEventFilters } from "@/components/capacity-building/training-event-filters";
import { TrainingEventPagination } from "@/components/capacity-building/training-event-pagination";
import { TrainingEventTable } from "@/components/capacity-building/training-event-table";
import { listTrainingEventsAction } from "@/lib/actions/training-events";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { TRAINING_EVENT_ACTION_ERROR_MESSAGE } from "@/lib/capacity-building/training-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { listTrainingEventsSchema } from "@/lib/validation/training-event";

export const metadata: Metadata = {
  title: "Capacity Building",
};

type CapacityBuildingPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CapacityBuildingPage({
  searchParams,
}: CapacityBuildingPageProps) {
  const params = await searchParams;
  const parsedQuery = listTrainingEventsSchema.safeParse({
    page: firstParam(params.page),
    pageSize: firstParam(params.pageSize),
    kind: firstParam(params.kind),
  });

  const sessionUser = await getCurrentSessionUser();
  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const listResult = parsedQuery.success
    ? await listTrainingEventsAction(parsedQuery.data)
    : { ok: false as const, code: "VALIDATION" as const };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Training events</h2>
          <p className="mt-1 text-sm text-slate-600">
            Kind is a constrained schema value: Training, Seminar, or Orientation.
          </p>
        </div>
        {canWrite ? (
          <Link
            className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href="/capacity-building/new"
          >
            New event
          </Link>
        ) : null}
      </div>

      {!parsedQuery.success || !listResult.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {TRAINING_EVENT_ACTION_ERROR_MESSAGE[
            parsedQuery.success && !listResult.ok ? listResult.code : "VALIDATION"
          ]}
        </p>
      ) : (
        <>
          <TrainingEventFilters values={parsedQuery.data} />
          <TrainingEventTable canWrite={canWrite} items={listResult.data.items} />
          <TrainingEventPagination
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
