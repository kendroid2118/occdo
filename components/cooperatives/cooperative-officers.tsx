"use client";

import { useActionState, useState } from "react";

import {
  deleteOfficerFormAction,
  saveOfficerFormAction,
  type OfficerRecord,
} from "@/lib/actions/officers";
import type { ReferenceRecord } from "@/lib/actions/reference";
import { OFFICER_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/officer-errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type CooperativeOfficersProps = {
  cooperativeId: string;
  officers: OfficerRecord[];
  positions: ReferenceRecord[];
  canWrite: boolean;
};

export function CooperativeOfficers({
  cooperativeId,
  officers,
  positions,
  canWrite,
}: CooperativeOfficersProps) {
  const [editing, setEditing] = useState<OfficerRecord | null>(null);
  const [state, formAction, pending] = useActionState(saveOfficerFormAction, null);
  const errorMessage =
    state && state.ok === false ? OFFICER_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Officers / Contacts</h3>

      {officers.length === 0 ? (
        <p className="text-sm text-slate-600">No officers recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Position</th>
                <th className="py-2 pr-3 font-medium">Contact</th>
                <th className="py-2 pr-3 font-medium">Primary</th>
                {canWrite ? <th className="py-2 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {officers.map((officer) => (
                <tr className="border-b border-slate-100 last:border-0" key={officer.id}>
                  <td className="py-2 pr-3 text-slate-900">{officer.fullName}</td>
                  <td className="py-2 pr-3 text-slate-700">{officer.position.name}</td>
                  <td className="py-2 pr-3 text-slate-700">
                    {officer.contactNumber ?? officer.email ?? "—"}
                  </td>
                  <td className="py-2 pr-3 text-slate-700">
                    {officer.isPrimaryContact ? "Yes" : "No"}
                  </td>
                  {canWrite ? (
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditing(officer)}
                          type="button"
                          variant="ghost"
                        >
                          Edit
                        </Button>
                        <form action={deleteOfficerFormAction}>
                          <input name="id" type="hidden" value={officer.id} />
                          <input name="cooperativeId" type="hidden" value={cooperativeId} />
                          <Button type="submit" variant="ghost">
                            Remove
                          </Button>
                        </form>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite ? (
        <form action={formAction} className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
          <input name="cooperativeId" type="hidden" value={cooperativeId} />
          {editing ? <input name="id" type="hidden" value={editing.id} /> : null}

          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-slate-900">
              {editing ? "Edit officer" : "Add officer"}
            </h4>
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-700 md:col-span-2" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="fullName">
              Full name
            </label>
            <input
              className={fieldClass}
              defaultValue={editing?.fullName ?? ""}
              id="fullName"
              key={`fullName-${editing?.id ?? "new"}`}
              name="fullName"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="positionId">
              Position
            </label>
            <select
              className={fieldClass}
              defaultValue={editing?.positionId ?? ""}
              id="positionId"
              key={`positionId-${editing?.id ?? "new"}`}
              name="positionId"
              required
            >
              <option value="">Select position</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="contactNumber">
              Contact number
            </label>
            <input
              className={fieldClass}
              defaultValue={editing?.contactNumber ?? ""}
              id="contactNumber"
              key={`contactNumber-${editing?.id ?? "new"}`}
              name="contactNumber"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="officerEmail">
              Email
            </label>
            <input
              className={fieldClass}
              defaultValue={editing?.email ?? ""}
              id="officerEmail"
              key={`email-${editing?.id ?? "new"}`}
              name="email"
              type="email"
            />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              defaultChecked={editing?.isPrimaryContact ?? false}
              id="isPrimaryContact"
              key={`primary-${editing?.id ?? "new"}`}
              name="isPrimaryContact"
              type="checkbox"
            />
            <label className="text-sm font-medium text-slate-800" htmlFor="isPrimaryContact">
              Primary contact
            </label>
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button disabled={pending || positions.length === 0} type="submit">
              {pending ? "Saving…" : editing ? "Save officer" : "Add officer"}
            </Button>
            {editing ? (
              <Button onClick={() => setEditing(null)} type="button" variant="outline">
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
