import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrainingEventForm } from "@/components/capacity-building/training-event-form";
import { listProgramCatalogsAction } from "@/lib/actions/programs";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "New training event",
};

export default async function NewTrainingEventPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const catalogsResult = await listProgramCatalogsAction({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">New training event</h2>
        <p className="mt-1 text-sm text-slate-600">
          Title, kind, start date, and venue are required. Program and service type are optional
          catalog links.
        </p>
      </div>
      {catalogsResult.ok ? (
        <TrainingEventForm catalogs={catalogsResult.data} />
      ) : (
        <p className="text-sm text-red-700" role="alert">
          Could not load reference catalogs.
        </p>
      )}
    </div>
  );
}
