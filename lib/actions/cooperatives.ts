"use server";

import { redirect } from "next/navigation";

import {
  roleActionClient,
  type ActionErrorCode,
  type ActionResult,
} from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  CooperativeConflictError,
  CooperativeNotFoundError,
  CooperativeReferenceError,
  createCooperative,
  getCooperativeById,
  listCooperatives,
  updateCooperative,
  type CooperativeListResult,
  type CooperativeRecord,
} from "@/lib/dal/cooperatives";
import {
  createCooperativeSchema,
  getCooperativeSchema,
  listCooperativesSchema,
  updateCooperativeSchema,
} from "@/lib/validation/cooperative";

export type { CooperativeListResult, CooperativeRecord } from "@/lib/dal/cooperatives";

export type CooperativeActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type CooperativeActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: CooperativeActionErrorCode };

async function mapCooperativeAction<T>(
  run: () => Promise<ActionResult<T>>,
): Promise<CooperativeActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof CooperativeConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    if (error instanceof CooperativeNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CooperativeReferenceError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const createCooperativeInner = roleActionClient({
  schema: createCooperativeSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createCooperative({ input, actorId: user.id }),
});

const updateCooperativeInner = roleActionClient({
  schema: updateCooperativeSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    updateCooperative({ input, actorId: user.id }),
});

const getCooperativeInner = roleActionClient({
  schema: getCooperativeSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const cooperative = await getCooperativeById(input.id);
    if (!cooperative) {
      throw new CooperativeNotFoundError();
    }
    return cooperative;
  },
});

const listCooperativesInner = roleActionClient({
  schema: listCooperativesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listCooperatives(input),
});

export async function createCooperativeAction(
  input: unknown,
): Promise<CooperativeActionResult<CooperativeRecord>> {
  return mapCooperativeAction(() => createCooperativeInner(input));
}

export async function updateCooperativeAction(
  input: unknown,
): Promise<CooperativeActionResult<CooperativeRecord>> {
  return mapCooperativeAction(() => updateCooperativeInner(input));
}

export async function getCooperativeAction(
  input: unknown,
): Promise<CooperativeActionResult<CooperativeRecord>> {
  return mapCooperativeAction(() => getCooperativeInner(input));
}

export async function listCooperativesAction(
  input: unknown,
): Promise<CooperativeActionResult<CooperativeListResult>> {
  return mapCooperativeAction(() => listCooperativesInner(input));
}

function cooperativeFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    cooperativeCode: formData.get("cooperativeCode"),
    registrationNumber: formData.get("registrationNumber"),
    name: formData.get("name"),
    acronym: formData.get("acronym"),
    typeId: formData.get("typeId"),
    sectorId: formData.get("sectorId"),
    address: formData.get("address"),
    barangayId: formData.get("barangayId"),
    contactPerson: formData.get("contactPerson"),
    contactNumber: formData.get("contactNumber"),
    email: formData.get("email"),
    dateRegistered: formData.get("dateRegistered"),
    dateAccredited: formData.get("dateAccredited"),
    accreditationStatusId: formData.get("accreditationStatusId"),
    statusId: formData.get("statusId"),
    totalMembers: formData.get("totalMembers"),
    maleMembers: formData.get("maleMembers"),
    femaleMembers: formData.get("femaleMembers"),
    remarks: formData.get("remarks"),
  };
}

export async function createCooperativeFormAction(
  _previous: CooperativeActionResult<CooperativeRecord> | null,
  formData: FormData,
): Promise<CooperativeActionResult<CooperativeRecord>> {
  const result = await createCooperativeAction(cooperativeFormValues(formData));
  if (result.ok) {
    redirect("/cooperatives");
  }
  return result;
}

export async function updateCooperativeFormAction(
  _previous: CooperativeActionResult<CooperativeRecord> | null,
  formData: FormData,
): Promise<CooperativeActionResult<CooperativeRecord>> {
  const result = await updateCooperativeAction(cooperativeFormValues(formData));
  if (result.ok) {
    redirect("/cooperatives");
  }
  return result;
}
