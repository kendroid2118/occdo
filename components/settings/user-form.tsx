"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  createManagedUserFormAction,
  updateManagedUserFormAction,
  type UserForUi,
} from "@/lib/actions/users";
import type { AuthRole } from "@/lib/auth/roles";
import { USER_ACTION_ERROR_MESSAGE } from "@/lib/users/form-errors";
import { USER_ROLE_LABEL } from "@/lib/users/access";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type UserFormProps = {
  assignableRoles: AuthRole[];
  user?: UserForUi;
};

export function UserForm({ assignableRoles, user }: UserFormProps) {
  const isEdit = Boolean(user);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateManagedUserFormAction : createManagedUserFormAction,
    null,
  );
  const errorMessage = state && state.ok === false ? USER_ACTION_ERROR_MESSAGE[state.code] : null;
  const roles = assignableRoles;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {user ? <input name="id" type="hidden" value={user.id} /> : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="off"
            className={fieldClass}
            defaultValue={user?.email ?? ""}
            disabled={isEdit}
            id="email"
            name="email"
            required={!isEdit}
            type="email"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="name">
            Name
          </label>
          <input className={fieldClass} defaultValue={user?.name ?? ""} id="name" name="name" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="role">
            Role
          </label>
          <select
            className={fieldClass}
            defaultValue={user?.role ?? "USER"}
            id="role"
            name="role"
            required
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {USER_ROLE_LABEL[role]}
              </option>
            ))}
          </select>
        </div>
        {isEdit ? null : (
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-slate-800" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className={fieldClass}
              id="password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
            <input
              defaultChecked={user?.isActive ?? true}
              id="isActive"
              name="isActive"
              type="checkbox"
              value="true"
            />
            Active
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          {isEdit ? "Save user" : "Create user"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/settings/users">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
