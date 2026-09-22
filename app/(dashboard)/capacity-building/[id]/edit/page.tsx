import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrainingEventForm } from "@/components/capacity-building/training-event-form";
import { listProgramCatalogsAction } from "@/lib/actions/programs";
import { getTrainingEventAction } from "@/lib/actions/training-events";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { TRAINING_EVENT_ACTION_ERROR_MESSAGE } from "@/lib/capacity-building/training-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "Edit training event",
};

type EditTrainingEventPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTrainingEventPage({
  params,
}: EditTrainingEventPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canWriteCooperatives(sessionUser.role)) {
    notFound();
  }

  const { id } = await params;
  const [eventResult, catalogsResult] = await Promise.all([
    getTrainingEventAction({ id }),
    listProgramCatalogsAction({}),
  ]);

  if (!eventResult.ok) {
    if (eventResult.code === "NOT_FOUND" || eventResult.code === "VALIDATION") {
      notFound();
    }
    return (
      <p className="text-sm text-red-700" role="alert">
        {TRAINING_EVENT_ACTION_ERROR_MESSAGE[eventResult.code]}
      </p>
    );
  }

  if (!catalogsResult.ok) {
    return (
      <p className="text-sm text-red-700" role="alert">
        Could not load reference catalogs.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Edit training event</h2>
        <p className="mt-1 text-sm text-slate-600">{eventResult.data.title}</p>
      </div>
      <TrainingEventForm catalogs={catalogsResult.data} event={eventResult.data} />
    </div>
  );
}
