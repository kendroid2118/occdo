import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { UserForm } from "@/components/settings/user-form";
import { getManagedUserAction } from "@/lib/actions/users";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { assignableRolesFor, canAdministerUsers, canManageUserRole } from "@/lib/users/access";

export const metadata: Metadata = {
  title: "Edit user",
};

type EditManagedUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManagedUserPage({ params }: EditManagedUserPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerUsers(sessionUser.role)) {
    notFound();
  }

  const { id } = await params;
  const result = await getManagedUserAction({ id });
  if (!result.ok || !canManageUserRole(sessionUser.role, result.data.role)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Edit user</h2>
        <p className="mt-1 text-sm text-slate-600">
          Disable an account or change its role. Disabled users cannot sign in.
        </p>
      </div>
      <UserForm assignableRoles={assignableRolesFor(sessionUser.role)} user={result.data} />
    </div>
  );
}
