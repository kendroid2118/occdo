import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { UserList } from "@/components/settings/user-list";
import { listManagedUsersAction } from "@/lib/actions/users";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { USER_ACTION_ERROR_MESSAGE } from "@/lib/users/form-errors";
import { canAdministerUsers } from "@/lib/users/access";

export const metadata: Metadata = {
  title: "Users",
};

export default async function SettingsUsersPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerUsers(sessionUser.role)) {
    notFound();
  }

  const result = await listManagedUsersAction({});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create and disable OCCDO users and assign one of the four system roles.
          </p>
        </div>
        <Link
          className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          href="/settings/users/new"
        >
          New user
        </Link>
      </div>

      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {USER_ACTION_ERROR_MESSAGE[result.code]}
        </p>
      ) : (
        <UserList items={result.data} />
      )}
    </div>
  );
}
