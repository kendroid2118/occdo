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
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import {
  OfficerNotFoundError,
  OfficerScopeError,
  createOfficer,
  deleteOfficer,
  listOfficersByCooperativeId,
  updateOfficer,
  type OfficerRecord,
} from "@/lib/dal/officers";
import {
  createOfficerSchema,
  deleteOfficerSchema,
  listOfficersSchema,
  updateOfficerSchema,
} from "@/lib/validation/officer";

export type { OfficerRecord } from "@/lib/dal/officers";

export type OfficerActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type OfficerActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: OfficerActionErrorCode };

async function mapOfficerAction<T>(
  run: () => Promise<ActionResult<T>>,
): Promise<OfficerActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof OfficerScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (
      error instanceof OfficerNotFoundError ||
      error instanceof CooperativeNotFoundError
    ) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CooperativeReferenceError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const listOfficersInner = roleActionClient({
  schema: listOfficersSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listOfficersByCooperativeId(input.cooperativeId),
});

const createOfficerInner = roleActionClient({
  schema: createOfficerSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createOfficer({ input, actorId: user.id }),
});

const updateOfficerInner = roleActionClient({
  schema: updateOfficerSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    updateOfficer({ input, actorId: user.id }),
});

const deleteOfficerInner = roleActionClient({
  schema: deleteOfficerSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    deleteOfficer({ input, actorId: user.id }),
});

export async function listOfficersAction(
  input: unknown,
): Promise<OfficerActionResult<OfficerRecord[]>> {
  return mapOfficerAction(() => listOfficersInner(input));
}

export async function createOfficerAction(
  input: unknown,
): Promise<OfficerActionResult<OfficerRecord>> {
  return mapOfficerAction(() => createOfficerInner(input));
}

export async function updateOfficerAction(
  input: unknown,
): Promise<OfficerActionResult<OfficerRecord>> {
  return mapOfficerAction(() => updateOfficerInner(input));
}

export async function deleteOfficerAction(
  input: unknown,
): Promise<OfficerActionResult<{ id: string }>> {
  return mapOfficerAction(() => deleteOfficerInner(input));
}

function officerFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    cooperativeId: formData.get("cooperativeId"),
    positionId: formData.get("positionId"),
    fullName: formData.get("fullName"),
    contactNumber: formData.get("contactNumber"),
    email: formData.get("email"),
    isPrimaryContact: formData.get("isPrimaryContact"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") ?? true,
    remarks: formData.get("remarks"),
  };
}

export async function saveOfficerFormAction(
  previous: OfficerActionResult<OfficerRecord> | null,
  formData: FormData,
): Promise<OfficerActionResult<OfficerRecord>> {
  const id = formData.get("id");
  if (typeof id === "string" && id.trim()) {
    return updateOfficerFormAction(previous, formData);
  }
  return createOfficerFormAction(previous, formData);
}

export async function createOfficerFormAction(
  _previous: OfficerActionResult<OfficerRecord> | null,
  formData: FormData,
): Promise<OfficerActionResult<OfficerRecord>> {
  const values = officerFormValues(formData);
  const result = await createOfficerAction(values);
  if (result.ok && typeof values.cooperativeId === "string") {
    redirect(`/cooperatives/${values.cooperativeId}`);
  }
  return result;
}

export async function updateOfficerFormAction(
  _previous: OfficerActionResult<OfficerRecord> | null,
  formData: FormData,
): Promise<OfficerActionResult<OfficerRecord>> {
  const values = officerFormValues(formData);
  const result = await updateOfficerAction(values);
  if (result.ok && typeof values.cooperativeId === "string") {
    redirect(`/cooperatives/${values.cooperativeId}`);
  }
  return result;
}

export async function deleteOfficerFormAction(formData: FormData): Promise<void> {
  const cooperativeId = formData.get("cooperativeId");
  const result = await deleteOfficerAction({
    id: formData.get("id"),
    cooperativeId,
  });
  if (result.ok && typeof cooperativeId === "string") {
    redirect(`/cooperatives/${cooperativeId}`);
  }
}
