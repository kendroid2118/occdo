import Link from "next/link";

import type { CooperativeRecord } from "@/lib/actions/cooperatives";
import { MembershipForm } from "@/components/cooperatives/membership-form";
import { Button } from "@/components/ui/button";

type CooperativeProfileProps = {
  cooperative: CooperativeRecord;
  canWrite: boolean;
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

export function CooperativeProfile({ cooperative, canWrite }: CooperativeProfileProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{cooperative.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{cooperative.cooperativeCode}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/cooperatives">Back to masterlist</Link>
          </Button>
          {canWrite ? (
            <Button asChild>
              <Link href={`/cooperatives/${cooperative.id}/edit`}>Edit cooperative</Link>
            </Button>
          ) : null}
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Identity</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Cooperative code" value={cooperative.cooperativeCode} />
          <Field label="Registration number" value={cooperative.registrationNumber ?? "—"} />
          <Field label="Name" value={cooperative.name} />
          <Field label="Acronym" value={cooperative.acronym ?? "—"} />
          <Field label="Type" value={cooperative.type.name} />
          <Field label="Sector" value={cooperative.sector.name} />
          <Field label="Address" value={cooperative.address} />
          <Field label="Barangay" value={cooperative.barangay.name} />
          <Field label="Contact person" value={cooperative.contactPerson} />
          <Field label="Contact number" value={cooperative.contactNumber} />
          <Field label="Email" value={cooperative.email ?? "—"} />
          <Field label="Date registered" value={formatDate(cooperative.dateRegistered)} />
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Status</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Status" value={cooperative.status.name} />
          <Field label="Accreditation status" value={cooperative.accreditationStatus.name} />
          <Field label="Date accredited" value={formatDate(cooperative.dateAccredited)} />
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Membership</h3>
        {canWrite ? (
          <div className="mt-4">
            <MembershipForm
              cooperativeId={cooperative.id}
              femaleMembers={cooperative.femaleMembers}
              maleMembers={cooperative.maleMembers}
              totalMembers={cooperative.totalMembers}
            />
          </div>
        ) : (
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Total members" value={String(cooperative.totalMembers)} />
            <Field label="Male members" value={String(cooperative.maleMembers)} />
            <Field label="Female members" value={String(cooperative.femaleMembers)} />
          </dl>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-900">Remarks</h3>
        <p className="mt-3 text-sm text-slate-800">{cooperative.remarks ?? "—"}</p>
      </section>
    </div>
  );
}
