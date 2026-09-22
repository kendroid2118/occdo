"use client";

import { useActionState } from "react";

import type { CooperativeCatalogs } from "@/lib/actions/reference";
import {
  createCooperativeFormAction,
  updateCooperativeFormAction,
  type CooperativeRecord,
} from "@/lib/actions/cooperatives";
import { COOPERATIVE_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/form-errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

function dateInputValue(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

type CooperativeFormProps = {
  catalogs: CooperativeCatalogs;
  cooperative?: CooperativeRecord;
};

export function CooperativeForm({ catalogs, cooperative }: CooperativeFormProps) {
  const isEdit = Boolean(cooperative);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCooperativeFormAction : createCooperativeFormAction,
    null,
  );
  const catalogsReady =
    catalogs.types.length > 0 &&
    catalogs.sectors.length > 0 &&
    catalogs.statuses.length > 0 &&
    catalogs.accreditationStatuses.length > 0 &&
    catalogs.barangays.length > 0;
  const errorMessage =
    state && state.ok === false ? COOPERATIVE_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {cooperative ? <input name="id" type="hidden" value={cooperative.id} /> : null}

      {!catalogsReady ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Reference catalogs are empty. Add active types, sectors, statuses,
          accreditation statuses, and barangays before saving.
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="cooperativeCode">
            Cooperative code
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.cooperativeCode ?? ""}
            id="cooperativeCode"
            name="cooperativeCode"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="registrationNumber">
            Registration number
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.registrationNumber ?? ""}
            id="registrationNumber"
            name="registrationNumber"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="name">
            Name
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.name ?? ""}
            id="name"
            name="name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="acronym">
            Acronym
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.acronym ?? ""}
            id="acronym"
            name="acronym"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="typeId">
            Type
          </label>
          <select
            className={fieldClass}
            defaultValue={cooperative?.typeId ?? ""}
            id="typeId"
            name="typeId"
            required
          >
            <option value="">Select type</option>
            {catalogs.types.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="sectorId">
            Sector
          </label>
          <select
            className={fieldClass}
            defaultValue={cooperative?.sectorId ?? ""}
            id="sectorId"
            name="sectorId"
            required
          >
            <option value="">Select sector</option>
            {catalogs.sectors.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="statusId">
            Status
          </label>
          <select
            className={fieldClass}
            defaultValue={cooperative?.statusId ?? ""}
            id="statusId"
            name="statusId"
            required
          >
            <option value="">Select status</option>
            {catalogs.statuses.map((option) => (
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
            defaultValue={cooperative?.accreditationStatusId ?? ""}
            id="accreditationStatusId"
            name="accreditationStatusId"
            required
          >
            <option value="">Select accreditation status</option>
            {catalogs.accreditationStatuses.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="address">
            Address
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.address ?? ""}
            id="address"
            name="address"
            required
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="barangayId">
            Barangay
          </label>
          <select
            className={fieldClass}
            defaultValue={cooperative?.barangayId ?? ""}
            id="barangayId"
            name="barangayId"
            required
          >
            <option value="">Select barangay</option>
            {catalogs.barangays.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="contactPerson">
            Contact person
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.contactPerson ?? ""}
            id="contactPerson"
            name="contactPerson"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="contactNumber">
            Contact number
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.contactNumber ?? ""}
            id="contactNumber"
            name="contactNumber"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="email">
            Email
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.email ?? ""}
            id="email"
            name="email"
            type="email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="dateRegistered">
            Date registered
          </label>
          <input
            className={fieldClass}
            defaultValue={dateInputValue(cooperative?.dateRegistered)}
            id="dateRegistered"
            name="dateRegistered"
            type="date"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="dateAccredited">
            Date accredited
          </label>
          <input
            className={fieldClass}
            defaultValue={dateInputValue(cooperative?.dateAccredited)}
            id="dateAccredited"
            name="dateAccredited"
            type="date"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="totalMembers">
            Total members
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.totalMembers ?? 0}
            id="totalMembers"
            min={0}
            name="totalMembers"
            required
            type="number"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="maleMembers">
            Male members
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.maleMembers ?? 0}
            id="maleMembers"
            min={0}
            name="maleMembers"
            required
            type="number"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="femaleMembers">
            Female members
          </label>
          <input
            className={fieldClass}
            defaultValue={cooperative?.femaleMembers ?? 0}
            id="femaleMembers"
            min={0}
            name="femaleMembers"
            required
            type="number"
          />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="remarks">
            Remarks
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            defaultValue={cooperative?.remarks ?? ""}
            id="remarks"
            name="remarks"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending || !catalogsReady} type="submit">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create cooperative"}
        </Button>
        <Button asChild variant="outline">
          <a href="/cooperatives">Cancel</a>
        </Button>
      </div>
    </form>
  );
}
