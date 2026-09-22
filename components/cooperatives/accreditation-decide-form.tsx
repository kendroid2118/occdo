"use client";

import { useActionState } from "react";

import {
  decideAccreditationCaseFormAction,
  type AccreditationCaseRecord,
} from "@/lib/actions/accreditation";
import type { CooperativeCatalogs } from "@/lib/actions/reference";
import { ACCREDITATION_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/accreditation-errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type AccreditationDecideFormProps = {
  catalogs: CooperativeCatalogs;
  record: AccreditationCaseRecord;
};

export function AccreditationDecideForm({
  catalogs,
  record,
}: AccreditationDecideFormProps) {
  const [state, formAction, pending] = useActionState(
    decideAccreditationCaseFormAction,
    null,
  );
  const catalogsReady =
    catalogs.caseStatuses.length > 0 && catalogs.accreditationStatuses.length > 0;
  const errorMessage =
    state && state.ok === false ? ACCREDITATION_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input name="id" type="hidden" value={record.id} />
      <input name="cooperativeId" type="hidden" value={record.cooperativeId} />

      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Active case statuses and accreditation statuses are required before deciding.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="statusId">
            Case status
          </label>
          <select
            className={fieldClass}
            defaultValue={record.statusId}
            id="statusId"
            name="statusId"
            required
          >
            {catalogs.caseStatuses.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            className="block text-sm font-medium text-slate-800"
            htmlFor="accreditationStatusId"
          >
            Accreditation status
          </label>
          <select
            className={fieldClass}
            defaultValue=""
            id="accreditationStatusId"
            name="accreditationStatusId"
            required
          >
            <option value="">Select an accreditation status</option>
            {catalogs.accreditationStatuses.map((option) => (
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
            defaultValue={record.remarks ?? ""}
            id="remarks"
            name="remarks"
          />
        </div>
      </div>

      <Button disabled={pending || !catalogsReady} type="submit">
        {pending ? "Saving…" : "Decide case"}
      </Button>
    </form>
  );
}
