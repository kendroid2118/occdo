"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  ComplianceRecordConflictError,
  ComplianceRecordNotFoundError,
  ComplianceRecordScopeError,
  ComplianceVerifyError,
  createComplianceRecord,
  getComplianceRecordById,
  listActiveComplianceStatuses,
  listComplianceRecords,
  verifyComplianceRecord,
  type ComplianceRecord,
  type ComplianceRecordListResult,
} from "@/lib/dal/compliance-records";
import {
  ComplianceRequirementInactiveError,
  ComplianceRequirementNotFoundError,
  listActiveComplianceRequirements,
  type ComplianceRequirementRecord,
} from "@/lib/dal/compliance-requirements";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import type { ReferenceRecord } from "@/lib/dal/reference";
import {
  createComplianceRecordSchema,
  getComplianceRecordSchema,
  listComplianceCatalogsSchema,
  listComplianceRecordsSchema,
  verifyComplianceRecordSchema,
} from "@/lib/validation/compliance-record";

export type { ComplianceRecord, ComplianceRecordListResult, ComplianceRequirementRecord };

export type ComplianceCatalogs = {
  requirements: ComplianceRequirementRecord[];
  statuses: ReferenceRecord[];
};

export type ComplianceActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type ComplianceActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ComplianceActionErrorCode };

async function mapComplianceAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<ComplianceActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof ComplianceRecordScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (
      error instanceof ComplianceRecordNotFoundError ||
      error instanceof ComplianceRequirementNotFoundError ||
      error instanceof CooperativeNotFoundError
    ) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (
      error instanceof ComplianceVerifyError ||
      error instanceof ComplianceRequirementInactiveError ||
      error instanceof CooperativeReferenceError
    ) {
      return { ok: false, code: "VALIDATION" };
    }
    if (error instanceof ComplianceRecordConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const createComplianceRecordInner = roleActionClient({
  schema: createComplianceRecordSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createComplianceRecord({ input, actorId: user.id }),
});

const verifyComplianceRecordInner = roleActionClient({
  schema: verifyComplianceRecordSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    verifyComplianceRecord({ input, actorId: user.id }),
});

const listComplianceRecordsInner = roleActionClient({
  schema: listComplianceRecordsSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listComplianceRecords(input),
});

const getComplianceRecordInner = roleActionClient({
  schema: getComplianceRecordSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getComplianceRecordById(input.id);
    if (!record) {
      throw new ComplianceRecordNotFoundError();
    }
    return record;
  },
});

export const listComplianceCatalogsAction = roleActionClient({
  schema: listComplianceCatalogsSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<ComplianceCatalogs> => {
    const [requirements, statuses] = await Promise.all([
      listActiveComplianceRequirements(),
      listActiveComplianceStatuses(),
    ]);
    return { requirements, statuses };
  },
});

export async function createComplianceRecordAction(
  input: unknown,
): Promise<ComplianceActionResult<ComplianceRecord>> {
  return mapComplianceAction(() => createComplianceRecordInner(input));
}

export async function verifyComplianceRecordAction(
  input: unknown,
): Promise<ComplianceActionResult<ComplianceRecord>> {
  return mapComplianceAction(() => verifyComplianceRecordInner(input));
}

export async function listComplianceRecordsAction(
  input: unknown,
): Promise<ComplianceActionResult<ComplianceRecordListResult>> {
  return mapComplianceAction(() => listComplianceRecordsInner(input));
}

export async function getComplianceRecordAction(
  input: unknown,
): Promise<ComplianceActionResult<ComplianceRecord>> {
  return mapComplianceAction(() => getComplianceRecordInner(input));
}

export async function createComplianceRecordFormAction(
  _previous: ComplianceActionResult<ComplianceRecord> | null,
  formData: FormData,
): Promise<ComplianceActionResult<ComplianceRecord>> {
  const result = await createComplianceRecordAction({
    cooperativeId: formData.get("cooperativeId"),
    requirementId: formData.get("requirementId"),
    reportingPeriod: formData.get("reportingPeriod"),
    dueDate: formData.get("dueDate"),
    submittedDate: formData.get("submittedDate"),
    remarks: formData.get("remarks"),
  });
  if (result.ok) {
    redirect("/monitoring");
  }
  return result;
}

export async function verifyComplianceRecordFormAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const result = await verifyComplianceRecordAction({
    id,
    cooperativeId: formData.get("cooperativeId"),
  });
  if (result.ok && typeof id === "string") {
    redirect(`/monitoring/${id}`);
  }
}
