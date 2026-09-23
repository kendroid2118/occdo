import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserForm } from "@/components/settings/user-form";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { assignableRolesFor, canAdministerUsers } from "@/lib/users/access";

export const metadata: Metadata = {
  title: "New user",
};

export default async function NewManagedUserPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerUsers(sessionUser.role)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">New user</h2>
        <p className="mt-1 text-sm text-slate-600">
          SUPER_ADMIN and DEVELOPER roles can only be assigned by SUPER_ADMIN or DEVELOPER.
        </p>
      </div>
      <UserForm assignableRoles={assignableRolesFor(sessionUser.role)} />
    </div>
  );
}
