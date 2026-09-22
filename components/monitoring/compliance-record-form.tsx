"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ComplianceCatalogs } from "@/lib/actions/compliance-records";
import { createComplianceRecordFormAction } from "@/lib/actions/compliance-records";
import { COMPLIANCE_ACTION_ERROR_MESSAGE } from "@/lib/compliance/errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

export type ComplianceCooperativeOption = {
  id: string;
  name: string;
  cooperativeCode: string;
};

type ComplianceRecordFormProps = {
  catalogs: ComplianceCatalogs;
  cooperatives: ComplianceCooperativeOption[];
  defaultCooperativeId?: string;
};

export function ComplianceRecordForm({
  catalogs,
  cooperatives,
  defaultCooperativeId,
}: ComplianceRecordFormProps) {
  const [state, formAction, pending] = useActionState(
    createComplianceRecordFormAction,
    null,
  );
  const catalogsReady = catalogs.requirements.length > 0 && cooperatives.length > 0;
  const errorMessage =
    state && state.ok === false ? COMPLIANCE_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Active compliance requirements and at least one cooperative are required.
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
          <label className="block text-sm font-medium text-slate-800" htmlFor="requirementId">
            Requirement
          </label>
          <select className={fieldClass} defaultValue="" id="requirementId" name="requirementId" required>
            <option value="">Select a requirement</option>
            {catalogs.requirements.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="reportingPeriod">
            Reporting period
          </label>
          <input
            className={fieldClass}
            id="reportingPeriod"
            name="reportingPeriod"
            placeholder="2026 or 2026-Q1"
            required
            type="text"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="dueDate">
            Due date
          </label>
          <input className={fieldClass} id="dueDate" name="dueDate" required type="date" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="submittedDate">
            Date submitted
          </label>
          <input className={fieldClass} id="submittedDate" name="submittedDate" type="date" />
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
          {pending ? "Saving…" : "Create record"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/monitoring">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
