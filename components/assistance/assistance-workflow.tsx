"use client";

import { useActionState } from "react";

import {
  approveAssistanceRecordFormAction,
  releaseAssistanceRecordFormAction,
  updateAssistanceAmountFormAction,
  type AssistanceRecord,
} from "@/lib/actions/assistance";
import { ASSISTANCE_STATUS_CODES } from "@/lib/assistance/status-codes";
import { ASSISTANCE_ACTION_ERROR_MESSAGE } from "@/lib/assistance/errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type AssistanceWorkflowProps = {
  record: AssistanceRecord;
};

export function AssistanceWorkflow({ record }: AssistanceWorkflowProps) {
  const [state, formAction, pending] = useActionState(
    updateAssistanceAmountFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false ? ASSISTANCE_ACTION_ERROR_MESSAGE[state.code] : null;
  const canUpdateAmount = record.status.code === ASSISTANCE_STATUS_CODES.REQUESTED;
  const canApprove = record.status.code === ASSISTANCE_STATUS_CODES.REQUESTED;
  const canRelease = record.status.code === ASSISTANCE_STATUS_CODES.APPROVED;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Amount and status</h3>
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {canUpdateAmount ? (
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <input name="id" type="hidden" value={record.id} />
          <input name="cooperativeId" type="hidden" value={record.cooperativeId} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="amount">
              Amount
            </label>
            <input
              className={fieldClass}
              defaultValue={record.amount}
              id="amount"
              min="0.01"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </div>
          <Button disabled={pending} type="submit">
            {pending ? "Saving…" : "Update amount"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-slate-600">Amount is locked after approval.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {canApprove ? (
          <form action={approveAssistanceRecordFormAction}>
            <input name="id" type="hidden" value={record.id} />
            <input name="cooperativeId" type="hidden" value={record.cooperativeId} />
            <Button type="submit">Approve</Button>
          </form>
        ) : null}
        {canRelease ? (
          <form action={releaseAssistanceRecordFormAction}>
            <input name="id" type="hidden" value={record.id} />
            <input name="cooperativeId" type="hidden" value={record.cooperativeId} />
            <Button type="submit">Release</Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
