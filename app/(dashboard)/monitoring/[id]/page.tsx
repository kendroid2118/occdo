import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComplianceVerifyForm } from "@/components/monitoring/compliance-verify-form";
import { getComplianceRecordAction } from "@/lib/actions/compliance-records";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { COMPLIANCE_ACTION_ERROR_MESSAGE } from "@/lib/compliance/errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Compliance record",
};

type ComplianceDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | string | null): string {
  if (!value) {
    return "—";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toISOString().slice(0, 10);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function ComplianceRecordPage({ params }: ComplianceDetailPageProps) {
  const { id } = await params;
  const [result, sessionUser] = await Promise.all([
    getComplianceRecordAction({ id }),
    getCurrentSessionUser(),
  ]);

  if (!result.ok) {
    if (result.code === "NOT_FOUND" || result.code === "VALIDATION") {
      notFound();
    }
    return (
      <p className="text-sm text-red-700" role="alert">
        {COMPLIANCE_ACTION_ERROR_MESSAGE[result.code]}
      </p>
    );
  }

  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const record = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Compliance record</h2>
          <p className="mt-1 text-sm text-slate-600">
            Linked cooperative:{" "}
            <Link
              className="font-medium text-occdo-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
              href={`/cooperatives/${record.cooperative.id}`}
            >
              {record.cooperative.name}
            </Link>
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/monitoring">Back to records</Link>
        </Button>
      </div>

      <dl className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <Field label="Requirement" value={record.requirement.name} />
        <Field
          label="Requirement status"
          value={record.requirement.isActive ? "Active" : "Inactive (historical)"}
        />
        <Field label="Period" value={record.reportingPeriod} />
        <Field label="Status" value={record.status.name} />
        <Field label="Due date" value={formatDate(record.dueDate)} />
        <Field label="Submitted" value={formatDate(record.submittedDate)} />
        <Field label="Verified at" value={formatDate(record.verifiedAt)} />
        <Field label="Verified by" value={record.verifiedBy?.name ?? "—"} />
        <Field label="Remarks" value={record.remarks ?? "—"} />
      </dl>

      {canWrite ? <ComplianceVerifyForm record={record} /> : null}
    </div>
  );
}
