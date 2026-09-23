import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canAdministerUsers } from "@/lib/users/access";
import {
  canAdministerReferenceData,
  canAdministerSystemConfig,
} from "@/lib/settings/access";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const sessionUser = await getCurrentSessionUser();
  const canUsers = sessionUser ? canAdministerUsers(sessionUser.role) : false;
  const canReference = sessionUser ? canAdministerReferenceData(sessionUser.role) : false;
  const canConfig = sessionUser ? canAdministerSystemConfig(sessionUser.role) : false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          User administration, maintainable catalogs, and non-secret office configuration.
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {canUsers ? (
          <li>
            <Link
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-occdo-700"
              href="/settings/users"
            >
              <h3 className="text-sm font-semibold text-slate-900">Users</h3>
              <p className="mt-1 text-sm text-slate-600">Create, disable, and assign roles.</p>
            </Link>
          </li>
        ) : null}
        {canReference ? (
          <li>
            <Link
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-occdo-700"
              href="/settings/reference"
            >
              <h3 className="text-sm font-semibold text-slate-900">Reference data</h3>
              <p className="mt-1 text-sm text-slate-600">
                Add or rename catalogs. Deactivate referenced rows instead of deleting them.
              </p>
            </Link>
          </li>
        ) : null}
        {canConfig ? (
          <li>
            <Link
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-occdo-700"
              href="/settings/configuration"
            >
              <h3 className="text-sm font-semibold text-slate-900">System configuration</h3>
              <p className="mt-1 text-sm text-slate-600">CDA Portal URL and other non-secret settings.</p>
            </Link>
          </li>
        ) : null}
        {!canUsers && !canReference && !canConfig ? (
          <li className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            You do not have permission to change settings.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
