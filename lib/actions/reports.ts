"use server";

import { z } from "zod";

import {
  roleActionClient,
  type ActionErrorCode,
  type ActionResult,
} from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import {
  ReportFilterError,
  getCooperativeReport,
  getMembershipReport,
  listReportCooperativeOptions,
  type CooperativeReport,
  type MembershipReport,
  type ReportCooperativeOption,
} from "@/lib/dal/reports";
import { reportFiltersSchema } from "@/lib/validation/reports";

export type {
  CooperativeReport,
  CooperativeReportRow,
  MembershipCurrentRow,
  MembershipCurrentTotals,
  MembershipReport,
  MembershipSnapshotRow,
  ReportCooperativeOption,
  ReportFiltersApplied,
} from "@/lib/dal/reports";

export type ReportActionErrorCode = ActionErrorCode;

export type ReportActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ReportActionErrorCode };

async function mapReportAction<T>(
  run: () => Promise<ActionResult<T>>,
): Promise<ReportActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof ReportFilterError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const listReportCooperativeOptionsInner = roleActionClient({
  schema: z.object({}),
  roles: AUTH_ROLES,
  handler: async (): Promise<ReportCooperativeOption[]> => listReportCooperativeOptions(),
});

const getCooperativeReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getCooperativeReport(input),
});

const getMembershipReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getMembershipReport(input),
});

export async function listReportCooperativeOptionsAction(
  input: unknown,
): Promise<ReportActionResult<ReportCooperativeOption[]>> {
  return mapReportAction(() => listReportCooperativeOptionsInner(input));
}

export async function getCooperativeReportAction(
  input: unknown,
): Promise<ReportActionResult<CooperativeReport>> {
  return mapReportAction(() => getCooperativeReportInner(input));
}

export async function getMembershipReportAction(
  input: unknown,
): Promise<ReportActionResult<MembershipReport>> {
  return mapReportAction(() => getMembershipReportInner(input));
}
