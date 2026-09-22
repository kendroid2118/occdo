"use client";

import { useActionState } from "react";

import { fileAccreditationCaseFormAction } from "@/lib/actions/accreditation";
import type { CooperativeCatalogs } from "@/lib/actions/reference";
import { ACCREDITATION_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/accreditation-errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export type AccreditationCooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type AccreditationFileFormProps = {
  catalogs: CooperativeCatalogs;
  cooperatives: AccreditationCooperativeOption[];
  defaultCooperativeId?: string;
};

export function AccreditationFileForm({
  catalogs,
  cooperatives,
  defaultCooperativeId,
}: AccreditationFileFormProps) {
  const [state, formAction, pending] = useActionState(
    fileAccreditationCaseFormAction,
    null,
  );
  const catalogsReady =
    catalogs.caseTypes.length > 0 &&
    catalogs.caseStatuses.length > 0 &&
    cooperatives.length > 0;
  const errorMessage =
    state && state.ok === false ? ACCREDITATION_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Active case types, case statuses, and at least one cooperative are required
          before filing.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="cooperativeId">
            Cooperative
          </label>
          <select
            className={fieldClass}
            defaultValue={defaultCooperativeId ?? ""}
            id="cooperativeId"
            name="cooperativeId"
            required
          >
            <option value="">Select a cooperative</option>
            {cooperatives.map((cooperative) => (
              <option key={cooperative.id} value={cooperative.id}>
                {cooperative.name} ({cooperative.cooperativeCode})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="typeId">
            Case type
          </label>
          <select className={fieldClass} defaultValue="" id="typeId" name="typeId" required>
            <option value="">Select a type</option>
            {catalogs.caseTypes.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="statusId">
            Case status
          </label>
          <select className={fieldClass} defaultValue="" id="statusId" name="statusId" required>
            <option value="">Select a status</option>
            {catalogs.caseStatuses.map((option) => (
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
            id="remarks"
            name="remarks"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending || !catalogsReady} type="submit">
          {pending ? "Filing…" : "File case"}
        </Button>
        <Button asChild variant="outline">
          <a href="/cooperatives/cases">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
