"use client";

import { useActionState } from "react";

import {
  createTrainingParticipantFormAction,
  type TrainingParticipantListRecord,
} from "@/lib/actions/training-participants";
import {
  ATTENDANCE_STATUS_LABEL,
  TRAINING_PARTICIPANT_ACTION_ERROR_MESSAGE,
} from "@/lib/capacity-building/participant-errors";
import { ATTENDANCE_STATUSES } from "@/lib/validation/training-participant";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export type ParticipantCooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type TrainingParticipantsProps = {
  trainingEventId: string;
  participants: TrainingParticipantListRecord[];
  cooperatives: ParticipantCooperativeOption[];
  canWrite: boolean;
};

export function TrainingParticipants({
  trainingEventId,
  participants,
  cooperatives,
  canWrite,
}: TrainingParticipantsProps) {
  const [state, formAction, pending] = useActionState(
    createTrainingParticipantFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false
      ? TRAINING_PARTICIPANT_ACTION_ERROR_MESSAGE[state.code]
      : null;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Participants</h3>

      {participants.length === 0 ? (
        <p className="text-sm text-slate-600">No participants recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Cooperative</th>
                <th className="py-2 font-medium">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((row) => (
                <tr className="border-b border-slate-100 last:border-0" key={row.id}>
                  <td className="py-2 pr-3 text-slate-900">{row.fullName}</td>
                  <td className="py-2 pr-3 text-slate-700">
                    {row.cooperative
                      ? `${row.cooperative.name} (${row.cooperative.cooperativeCode})`
                      : "Walk-in"}
                  </td>
                  <td className="py-2 text-slate-700">
                    {ATTENDANCE_STATUS_LABEL[row.attendanceStatus] ??
                      row.attendanceStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite ? (
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          <input name="trainingEventId" type="hidden" value={trainingEventId} />
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="fullName">
              Full name
            </label>
            <input
              className={fieldClass}
              id="fullName"
              name="fullName"
              required
              type="text"
            />
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="cooperativeId"
            >
              Cooperative
            </label>
            <select className={fieldClass} defaultValue="" id="cooperativeId" name="cooperativeId">
              <option value="">Walk-in (no cooperative)</option>
              {cooperatives.map((cooperative) => (
                <option key={cooperative.id} value={cooperative.id}>
                  {cooperative.name} ({cooperative.cooperativeCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="attendanceStatus"
            >
              Attendance
            </label>
            <select
              className={fieldClass}
              defaultValue="REGISTERED"
              id="attendanceStatus"
              name="attendanceStatus"
            >
              {ATTENDANCE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {ATTENDANCE_STATUS_LABEL[status] ?? status}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="mb-1 block text-sm font-medium text-slate-700"
              htmlFor="contactNumber"
            >
              Contact number
            </label>
            <input
              autoComplete="tel"
              className={fieldClass}
              id="contactNumber"
              name="contactNumber"
              type="tel"
            />
            <p className="mt-1 text-xs text-slate-500">
              Stored with the record. Not shown in participant lists.
            </p>
          </div>
          {errorMessage ? (
            <p className="sm:col-span-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <Button disabled={pending} type="submit">
              {pending ? "Adding…" : "Add participant"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
