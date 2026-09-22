import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrainingParticipants } from "@/components/capacity-building/training-participants";
import { listCooperativesAction } from "@/lib/actions/cooperatives";
import { listParticipantsByEventAction } from "@/lib/actions/training-participants";
import { getTrainingEventAction } from "@/lib/actions/training-events";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { TRAINING_KIND_LABEL } from "@/lib/capacity-building/training-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

export const metadata: Metadata = {
  title: "Training event",
};

type TrainingEventDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | string | null): string {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

export default async function TrainingEventDetailPage({
  params,
}: TrainingEventDetailPageProps) {
  const { id } = await params;
  const [eventResult, participantsResult, cooperativesResult, sessionUser] =
    await Promise.all([
      getTrainingEventAction({ id }),
      listParticipantsByEventAction({ trainingEventId: id }),
      listCooperativesAction({ page: 1, pageSize: 50 }),
      getCurrentSessionUser(),
    ]);

  if (!eventResult.ok) {
    if (eventResult.code === "NOT_FOUND" || eventResult.code === "VALIDATION") {
      notFound();
    }
    return (
      <p className="text-sm text-red-700" role="alert">
        Could not load this training event.
      </p>
    );
  }

  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const participants = participantsResult.ok ? participantsResult.data : [];
  const cooperatives = cooperativesResult.ok
    ? cooperativesResult.data.items.map((row) => ({
        id: row.id,
        name: row.name,
        cooperativeCode: row.cooperativeCode,
      }))
    : [];
  const event = eventResult.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{event.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {TRAINING_KIND_LABEL[event.kind] ?? event.kind} · {formatDate(event.startAt)}
            {event.endAt ? ` – ${formatDate(event.endAt)}` : ""} · {event.venue}
          </p>
        </div>
        {canWrite ? (
          <Link
            className="text-sm font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            href={`/capacity-building/${event.id}/edit`}
          >
            Edit event
          </Link>
        ) : null}
      </div>
      <TrainingParticipants
        canWrite={canWrite}
        cooperatives={cooperatives}
        participants={participants}
        trainingEventId={event.id}
      />
    </div>
  );
}
