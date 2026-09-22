import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AccreditationDecideForm } from "@/components/cooperatives/accreditation-decide-form";
import { getAccreditationCaseAction } from "@/lib/actions/accreditation";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { ACCREDITATION_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/accreditation-errors";
import { canWriteCooperatives } from "@/lib/cooperatives/access";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Accreditation case",
};

type CaseDetailPageProps = {
  params: Promise<{ caseId: string }>;
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

export default async function AccreditationCasePage({ params }: CaseDetailPageProps) {
  const { caseId } = await params;
  const [result, catalogsResult, sessionUser] = await Promise.all([
    getAccreditationCaseAction({ id: caseId }),
    listCooperativeCatalogsAction({}),
    getCurrentSessionUser(),
  ]);

  if (!result.ok) {
    if (result.code === "NOT_FOUND" || result.code === "VALIDATION") {
      notFound();
    }
    return (
      <p className="text-sm text-red-700" role="alert">
        {ACCREDITATION_ACTION_ERROR_MESSAGE[result.code]}
      </p>
    );
  }

  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const record = result.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Accreditation case</h2>
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
          <Link href="/cooperatives/cases">Back to cases</Link>
        </Button>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Case details</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cooperative" value={record.cooperative.name} />
          <Field label="Cooperative code" value={record.cooperative.cooperativeCode} />
          <Field label="Case type" value={record.type.name} />
          <Field label="Case status" value={record.status.name} />
          <Field label="Filed" value={formatDate(record.filedAt)} />
          <Field label="Decided" value={formatDate(record.decidedAt)} />
          <div className="sm:col-span-2">
            <Field label="Remarks" value={record.remarks ?? "—"} />
          </div>
        </dl>
      </section>

      {canWrite && catalogsResult.ok ? (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">Decide case</h3>
          <p className="mt-1 text-sm text-slate-600">
            Decision updates the case and the cooperative accreditation fields together.
          </p>
          <div className="mt-4">
            <AccreditationDecideForm catalogs={catalogsResult.data} record={record} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
