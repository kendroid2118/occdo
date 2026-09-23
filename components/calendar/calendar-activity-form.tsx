"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createCalendarActivityFormAction,
  updateCalendarActivityFormAction,
  type CalendarActivityRecord,
  type CalendarLinkOptions,
} from "@/lib/actions/calendar";
import { utcToManilaDateTimeLocal } from "@/lib/calendar/manila-datetime";
import { CALENDAR_ACTION_ERROR_MESSAGE, CALENDAR_KIND_LABEL } from "@/lib/calendar/form-errors";
import { CALENDAR_ACTIVITY_KINDS } from "@/lib/validation/calendar";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type CalendarActivityFormProps = {
  links: CalendarLinkOptions;
  activity?: CalendarActivityRecord;
};

export function CalendarActivityForm({ links, activity }: CalendarActivityFormProps) {
  const isEdit = Boolean(activity);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCalendarActivityFormAction : createCalendarActivityFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false ? CALENDAR_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {activity ? <input name="id" type="hidden" value={activity.id} /> : null}

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
            defaultValue={activity?.title ?? ""}
            id="title"
            name="title"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="kind">
            Type
          </label>
          <select
            className={fieldClass}
            defaultValue={activity?.kind ?? ""}
            id="kind"
            name="kind"
            required
          >
            <option value="">Select type</option>
            {CALENDAR_ACTIVITY_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {CALENDAR_KIND_LABEL[kind]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="location">
            Location
          </label>
          <input
            className={fieldClass}
            defaultValue={activity?.location ?? ""}
            id="location"
            name="location"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="startAt">
            Start (Asia/Manila)
          </label>
          <input
            className={fieldClass}
            defaultValue={activity ? utcToManilaDateTimeLocal(new Date(activity.startAt)) : ""}
            id="startAt"
            name="startAt"
            required
            type="datetime-local"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="endAt">
            End (Asia/Manila)
          </label>
          <input
            className={fieldClass}
            defaultValue={
              activity?.endAt ? utcToManilaDateTimeLocal(new Date(activity.endAt)) : ""
            }
            id="endAt"
            name="endAt"
            type="datetime-local"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="cooperativeId">
            Cooperative (optional)
          </label>
          <select
            className={fieldClass}
            defaultValue={activity?.cooperativeId ?? ""}
            id="cooperativeId"
            name="cooperativeId"
          >
            <option value="">None</option>
            {links.cooperatives.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name} ({row.cooperativeCode})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="trainingEventId">
            Training event (optional)
          </label>
          <select
            className={fieldClass}
            defaultValue={activity?.trainingEventId ?? ""}
            id="trainingEventId"
            name="trainingEventId"
          >
            <option value="">None</option>
            {links.trainingEvents.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
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
            defaultValue={activity?.remarks ?? ""}
            id="remarks"
            name="remarks"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          {isEdit ? "Save activity" : "Create activity"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/calendar">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
