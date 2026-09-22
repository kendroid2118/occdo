"use server";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  ComplianceRequirementConflictError,
  ComplianceRequirementInactiveError,
  ComplianceRequirementNotFoundError,
  createComplianceRequirement,
  getComplianceRequirementById,
  listActiveComplianceRequirements,
  requireActiveComplianceRequirement,
  type ComplianceRequirementRecord,
} from "@/lib/dal/compliance-requirements";
import {
  createComplianceRequirementSchema,
  getComplianceRequirementSchema,
  listComplianceRequirementsSchema,
} from "@/lib/validation/compliance-requirement";

export type { ComplianceRequirementRecord };

export type ComplianceRequirementActionErrorCode =
  | ActionErrorCode
  | "CONFLICT"
  | "NOT_FOUND";

export type ComplianceRequirementActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ComplianceRequirementActionErrorCode };

async function mapRequirementAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<ComplianceRequirementActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof ComplianceRequirementNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof ComplianceRequirementInactiveError) {
      return { ok: false, code: "VALIDATION" };
    }
    if (error instanceof ComplianceRequirementConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const listActiveComplianceRequirementsInner = roleActionClient({
  schema: listComplianceRequirementsSchema,
  roles: AUTH_ROLES,
  handler: async () => listActiveComplianceRequirements(),
});

const getComplianceRequirementInner = roleActionClient({
  schema: getComplianceRequirementSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getComplianceRequirementById(input.id);
    if (!record) {
      throw new ComplianceRequirementNotFoundError();
    }
    return record;
  },
});

const requireActiveComplianceRequirementInner = roleActionClient({
  schema: getComplianceRequirementSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => requireActiveComplianceRequirement(input.id),
});

const createComplianceRequirementInner = roleActionClient({
  schema: createComplianceRequirementSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createComplianceRequirement({ input, actorId: user.id }),
});

export async function listActiveComplianceRequirementsAction(
  input: unknown,
): Promise<ComplianceRequirementActionResult<ComplianceRequirementRecord[]>> {
  return mapRequirementAction(() => listActiveComplianceRequirementsInner(input));
}

export async function getComplianceRequirementAction(
  input: unknown,
): Promise<ComplianceRequirementActionResult<ComplianceRequirementRecord>> {
  return mapRequirementAction(() => getComplianceRequirementInner(input));
}

export async function requireActiveComplianceRequirementAction(
  input: unknown,
): Promise<ComplianceRequirementActionResult<ComplianceRequirementRecord>> {
  return mapRequirementAction(() => requireActiveComplianceRequirementInner(input));
}

export async function createComplianceRequirementAction(
  input: unknown,
): Promise<ComplianceRequirementActionResult<ComplianceRequirementRecord>> {
  return mapRequirementAction(() => createComplianceRequirementInner(input));
}
