"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AssistanceCatalogs } from "@/lib/actions/assistance";
import { createAssistanceRecordFormAction } from "@/lib/actions/assistance";
import { ASSISTANCE_ACTION_ERROR_MESSAGE } from "@/lib/assistance/errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export type AssistanceCooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type AssistanceFormProps = {
  catalogs: AssistanceCatalogs;
  cooperatives: AssistanceCooperativeOption[];
  defaultCooperativeId?: string;
};

export function AssistanceForm({
  catalogs,
  cooperatives,
  defaultCooperativeId,
}: AssistanceFormProps) {
  const [state, formAction, pending] = useActionState(
    createAssistanceRecordFormAction,
    null,
  );
  const catalogsReady = catalogs.types.length > 0 && cooperatives.length > 0;
  const errorMessage =
    state && state.ok === false ? ASSISTANCE_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Active assistance types and at least one cooperative are required before recording
          assistance.
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
          <label
            className="block text-sm font-medium text-slate-800"
            htmlFor="assistanceTypeId"
          >
            Assistance type
          </label>
          <select
            className={fieldClass}
            defaultValue=""
            id="assistanceTypeId"
            name="assistanceTypeId"
            required
          >
            <option value="">Select an assistance type</option>
            {catalogs.types.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="amount">
            Amount
          </label>
          <input
            className={fieldClass}
            id="amount"
            min="0.01"
            name="amount"
            required
            step="0.01"
            type="number"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="requestedAt">
            Date requested
          </label>
          <input className={fieldClass} id="requestedAt" name="requestedAt" required type="date" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="fundSource">
            Fund source
          </label>
          <input className={fieldClass} id="fundSource" name="fundSource" type="text" />
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
          {pending ? "Saving…" : "Record assistance"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/financial-assistance">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
