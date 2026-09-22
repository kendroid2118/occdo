"use client";

import { useActionState } from "react";

import {
  createFundLedgerEntryFormAction,
  type FundLedgerEntryRecord,
  type FundLedgerSummary,
} from "@/lib/actions/fund-ledger";
import {
  ASSISTANCE_ACTION_ERROR_MESSAGE,
  FUND_LEDGER_ENTRY_KIND_LABEL,
} from "@/lib/assistance/errors";
import { ASSISTANCE_STATUS_CODES } from "@/lib/assistance/status-codes";
import { MANUAL_FUND_LEDGER_ENTRY_KINDS } from "@/lib/assistance/ledger-kinds";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type FundLedgerPanelProps = {
  assistanceRecordId: string;
  cooperativeId: string;
  statusCode: string;
  entries: FundLedgerEntryRecord[];
  summary: FundLedgerSummary;
  canWrite: boolean;
};

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

export function FundLedgerPanel({
  assistanceRecordId,
  cooperativeId,
  statusCode,
  entries,
  summary,
  canWrite,
}: FundLedgerPanelProps) {
  const [state, formAction, pending] = useActionState(
    createFundLedgerEntryFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false ? ASSISTANCE_ACTION_ERROR_MESSAGE[state.code] : null;
  const canAdd = canWrite && statusCode === ASSISTANCE_STATUS_CODES.RELEASED;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Fund monitoring</h3>
      <dl className="grid gap-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Disbursed
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{summary.disbursed}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Adjustments
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{summary.adjustments}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Recovered
          </dt>
          <dd className="mt-1 text-sm text-slate-900">{summary.recovered}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Net</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{summary.net}</dd>
        </div>
      </dl>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">No ledger entries yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="py-2 pr-3 font-medium">Date</th>
                <th className="py-2 pr-3 font-medium">Kind</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr className="border-b border-slate-100 last:border-0" key={entry.id}>
                  <td className="py-2 pr-3 text-slate-700">{formatDate(entry.entryDate)}</td>
                  <td className="py-2 pr-3 text-slate-700">
                    {FUND_LEDGER_ENTRY_KIND_LABEL[entry.entryKind] ?? entry.entryKind}
                  </td>
                  <td className="py-2 pr-3 text-slate-900">{entry.amount}</td>
                  <td className="py-2 text-slate-700">{entry.remarks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canAdd ? (
        <form action={formAction} className="grid gap-3 sm:grid-cols-2">
          <input name="assistanceRecordId" type="hidden" value={assistanceRecordId} />
          <input name="cooperativeId" type="hidden" value={cooperativeId} />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="entryKind">
              Entry kind
            </label>
            <select className={fieldClass} defaultValue="ADJUSTMENT" id="entryKind" name="entryKind">
              {MANUAL_FUND_LEDGER_ENTRY_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {FUND_LEDGER_ENTRY_KIND_LABEL[kind] ?? kind}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="ledgerAmount">
              Amount
            </label>
            <input
              className={fieldClass}
              id="ledgerAmount"
              min="0.01"
              name="amount"
              required
              step="0.01"
              type="number"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="entryDate">
              Entry date
            </label>
            <input className={fieldClass} id="entryDate" name="entryDate" required type="date" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="ledgerRemarks">
              Remarks
            </label>
            <input className={fieldClass} id="ledgerRemarks" name="remarks" type="text" />
          </div>
          {errorMessage ? (
            <p className="sm:col-span-2 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <Button disabled={pending} type="submit">
              {pending ? "Saving…" : "Add ledger entry"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-600">
          Adjustment and recovery entries can be added after funds are released.
        </p>
      )}
    </section>
  );
}
