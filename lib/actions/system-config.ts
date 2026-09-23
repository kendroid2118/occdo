"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { getCdaPortalUrl as getEnvCdaPortalUrl } from "@/lib/dashboard/cda-portal";
import { getSystemConfigValue, upsertCdaPortalUrl } from "@/lib/dal/system-config";
import { SYSTEM_CONFIG_ROLES } from "@/lib/settings/access";
import { upsertCdaPortalUrlSchema } from "@/lib/validation/catalog-admin";
import { z } from "zod";

export type SystemConfigActionErrorCode = ActionErrorCode;

export type SystemConfigActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: SystemConfigActionErrorCode };

export type CdaPortalConfig = {
  storedValue: string | null;
  resolvedUrl: string | null;
};

const emptySchema = z.object({});

function parseStoredCdaUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }
  if (!value.startsWith("https://") && !value.startsWith("http://")) {
    return null;
  }
  return value;
}

const getInner = roleActionClient({
  schema: emptySchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<CdaPortalConfig> => {
    const storedValue = await getSystemConfigValue("cdaPortalUrl");
    return {
      storedValue,
      resolvedUrl: parseStoredCdaUrl(storedValue) ?? getEnvCdaPortalUrl(),
    };
  },
});

const upsertInner = roleActionClient({
  schema: upsertCdaPortalUrlSchema,
  roles: SYSTEM_CONFIG_ROLES,
  handler: async ({ user, input }) => {
    await upsertCdaPortalUrl({ actorId: user.id, value: input.value });
    const storedValue = await getSystemConfigValue("cdaPortalUrl");
    return {
      storedValue,
      resolvedUrl: parseStoredCdaUrl(storedValue) ?? getEnvCdaPortalUrl(),
    };
  },
});

export async function getCdaPortalConfigAction(
  input: unknown,
): Promise<SystemConfigActionResult<CdaPortalConfig>> {
  return getInner(input);
}

export async function upsertCdaPortalUrlAction(
  input: unknown,
): Promise<SystemConfigActionResult<CdaPortalConfig>> {
  return upsertInner(input);
}

export async function upsertCdaPortalUrlFormAction(
  _previous: SystemConfigActionResult<CdaPortalConfig> | null,
  formData: FormData,
): Promise<SystemConfigActionResult<CdaPortalConfig>> {
  const result = await upsertCdaPortalUrlAction({
    value: formData.get("value"),
  });
  if (result.ok) {
    redirect("/settings/configuration");
  }
  return result;
}
