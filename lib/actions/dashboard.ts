"use server";

import { roleActionClient } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { getDashboardSummary, type DashboardSummary } from "@/lib/dal/dashboard";
import { getDashboardSummarySchema } from "@/lib/validation/dashboard";

export type { DashboardSummary };

export const getDashboardSummaryAction = roleActionClient({
  schema: getDashboardSummarySchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<DashboardSummary> => getDashboardSummary(),
});
