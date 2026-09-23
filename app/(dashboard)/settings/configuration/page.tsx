import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CdaPortalForm } from "@/components/settings/cda-portal-form";
import { getCdaPortalConfigAction } from "@/lib/actions/system-config";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canAdministerSystemConfig } from "@/lib/settings/access";
import { SYSTEM_CONFIG_ACTION_ERROR_MESSAGE } from "@/lib/settings/form-errors";

export const metadata: Metadata = {
  title: "System configuration",
};

export default async function SettingsConfigurationPage() {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerSystemConfig(sessionUser.role)) {
    notFound();
  }

  const result = await getCdaPortalConfigAction({});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">System configuration</h2>
        <p className="mt-1 text-sm text-slate-600">
          Non-secret office settings. Authentication secrets and API credentials stay in environment
          variables.
        </p>
      </div>
      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {SYSTEM_CONFIG_ACTION_ERROR_MESSAGE[result.code]}
        </p>
      ) : (
        <CdaPortalForm config={result.data} />
      )}
    </div>
  );
}
