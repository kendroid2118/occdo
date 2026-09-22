"use client";

import { useActionState } from "react";

import { updateMembershipFormAction } from "@/lib/actions/membership";
import { MEMBERSHIP_ACTION_ERROR_MESSAGE } from "@/lib/cooperatives/membership-errors";
import { Button } from "@/components/ui/button";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type MembershipFormProps = {
  cooperativeId: string;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
};

export function MembershipForm({
  cooperativeId,
  totalMembers,
  maleMembers,
  femaleMembers,
}: MembershipFormProps) {
  const [state, formAction, pending] = useActionState(
    updateMembershipFormAction,
    null,
  );
  const errorMessage =
    state && state.ok === false ? MEMBERSHIP_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <input name="cooperativeId" type="hidden" value={cooperativeId} />
      {errorMessage ? (
        <p className="text-sm text-red-700 sm:col-span-3" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="totalMembers">
          Total members
        </label>
        <input
          className={fieldClass}
          defaultValue={totalMembers}
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
          defaultValue={maleMembers}
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
          defaultValue={femaleMembers}
          id="femaleMembers"
          min={0}
          name="femaleMembers"
          required
          type="number"
        />
      </div>
      <p className="text-xs text-slate-500 sm:col-span-3">
        Male and female counts do not need to equal the total until OCCDO confirms
        that rule.
      </p>
      <div className="sm:col-span-3">
        <Button disabled={pending} type="submit">
          {pending ? "Saving…" : "Save membership"}
        </Button>
      </div>
    </form>
  );
}
