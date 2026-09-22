"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ProgramCatalogs } from "@/lib/actions/programs";
import {
  createTrainingEventFormAction,
  updateTrainingEventFormAction,
  type TrainingEventRecord,
} from "@/lib/actions/training-events";
import {
  TRAINING_EVENT_ACTION_ERROR_MESSAGE,
  TRAINING_KIND_LABEL,
} from "@/lib/capacity-building/training-errors";
import { TRAINING_KINDS } from "@/lib/validation/training-event";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

function dateInputValue(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

type TrainingEventFormProps = {
  catalogs: ProgramCatalogs;
  event?: TrainingEventRecord;
};

export function TrainingEventForm({ catalogs, event }: TrainingEventFormProps) {
  const isEdit = Boolean(event);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateTrainingEventFormAction : createTrainingEventFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false ? TRAINING_EVENT_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {event ? <input name="id" type="hidden" value={event.id} /> : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="title">
            Title
          </label>
          <input
            className={fieldClass}
            defaultValue={event?.title ?? ""}
            id="title"
            name="title"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="kind">
            Kind
          </label>
          <select
            className={fieldClass}
            defaultValue={event?.kind ?? ""}
            id="kind"
            name="kind"
            required
          >
            <option value="">Select a kind</option>
            {TRAINING_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {TRAINING_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="venue">
            Venue
          </label>
          <input
            className={fieldClass}
            defaultValue={event?.venue ?? ""}
            id="venue"
            name="venue"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="startAt">
            Start date
          </label>
          <input
            className={fieldClass}
            defaultValue={dateInputValue(event?.startAt)}
            id="startAt"
            name="startAt"
            required
            type="date"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="endAt">
            End date
          </label>
          <input
            className={fieldClass}
            defaultValue={dateInputValue(event?.endAt)}
            id="endAt"
            name="endAt"
            type="date"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="programId">
            Program
          </label>
          <select
            className={fieldClass}
            defaultValue={event?.programId ?? ""}
            id="programId"
            name="programId"
          >
            <option value="">None</option>
            {catalogs.programs.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="serviceTypeId">
            Service type
          </label>
          <select
            className={fieldClass}
            defaultValue={event?.serviceTypeId ?? ""}
            id="serviceTypeId"
            name="serviceTypeId"
          >
            <option value="">None</option>
            {catalogs.serviceTypes.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="remarks">
            Remarks
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            defaultValue={event?.remarks ?? ""}
            id="remarks"
            name="remarks"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/capacity-building">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
