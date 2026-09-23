"use server";

import { z } from "zod";

import {
  roleActionClient,
  type ActionErrorCode,
  type ActionResult,
} from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import {
  listActiveAssistanceTypes,
  listActivePrograms,
  listActiveServiceTypes,
  listComplianceRequirements,
  listComplianceStatuses,
  listActiveAccreditationStatuses,
  listActiveBarangays,
  listActiveCooperativeSectors,
  listActiveCooperativeStatuses,
  listActiveCooperativeTypes,
  type ReferenceRecord,
} from "@/lib/dal/reference";
import {
  ReportFilterError,
  getCooperativeReport,
  getMembershipReport,
  listReportCooperativeOptions,
  type CooperativeReport,
  type MembershipReport,
  type ReportCooperativeOption,
} from "@/lib/dal/reports";
import {
  getAssistanceReport,
  getComplianceReport,
  getSummaryReport,
  getTrainingReport,
  type AssistanceReport,
  type ComplianceReport,
  type SummaryReport,
  type TrainingReport,
} from "@/lib/dal/reports-operational";
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

export type {
  AssistanceReport,
  AssistanceReportRow,
  ComplianceReport,
  ComplianceReportRow,
  LedgerMoneyTotals,
  SummaryReport,
  TrainingReport,
  TrainingReportRow,
} from "@/lib/dal/reports-operational";

export type ReportCatalogs = {
  types: ReferenceRecord[];
  sectors: ReferenceRecord[];
  statuses: ReferenceRecord[];
  accreditationStatuses: ReferenceRecord[];
  barangays: ReferenceRecord[];
  assistanceTypes: ReferenceRecord[];
  programs: ReferenceRecord[];
  serviceTypes: ReferenceRecord[];
  complianceStatuses: ReferenceRecord[];
  complianceRequirements: ReferenceRecord[];
};

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

const listReportCatalogsInner = roleActionClient({
  schema: z.object({}),
  roles: AUTH_ROLES,
  handler: async (): Promise<ReportCatalogs> => {
    const [
      types,
      sectors,
      statuses,
      accreditationStatuses,
      barangays,
      assistanceTypes,
      programs,
      serviceTypes,
      complianceStatuses,
      complianceRequirements,
    ] = await Promise.all([
      listActiveCooperativeTypes(),
      listActiveCooperativeSectors(),
      listActiveCooperativeStatuses(),
      listActiveAccreditationStatuses(),
      listActiveBarangays(),
      listActiveAssistanceTypes(),
      listActivePrograms(),
      listActiveServiceTypes(),
      listComplianceStatuses(),
      listComplianceRequirements(),
    ]);
    return {
      types,
      sectors,
      statuses,
      accreditationStatuses,
      barangays,
      assistanceTypes,
      programs,
      serviceTypes,
      complianceStatuses,
      complianceRequirements,
    };
  },
});

const getAssistanceReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getAssistanceReport(input),
});

const getTrainingReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getTrainingReport(input),
});

const getComplianceReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getComplianceReport(input),
});

const getSummaryReportInner = roleActionClient({
  schema: reportFiltersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getSummaryReport(input),
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

export async function listReportCatalogsAction(
  input: unknown,
): Promise<ReportActionResult<ReportCatalogs>> {
  return mapReportAction(() => listReportCatalogsInner(input));
}

export async function getAssistanceReportAction(
  input: unknown,
): Promise<ReportActionResult<AssistanceReport>> {
  return mapReportAction(() => getAssistanceReportInner(input));
}

export async function getTrainingReportAction(
  input: unknown,
): Promise<ReportActionResult<TrainingReport>> {
  return mapReportAction(() => getTrainingReportInner(input));
}

export async function getComplianceReportAction(
  input: unknown,
): Promise<ReportActionResult<ComplianceReport>> {
  return mapReportAction(() => getComplianceReportInner(input));
}

export async function getSummaryReportAction(
  input: unknown,
): Promise<ReportActionResult<SummaryReport>> {
  return mapReportAction(() => getSummaryReportInner(input));
}
