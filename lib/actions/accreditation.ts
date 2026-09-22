"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  AccreditationCaseNotFoundError,
  AccreditationCaseScopeError,
  decideAccreditationCase,
  fileAccreditationCase,
  getAccreditationCaseById,
  listAccreditationCases,
  type AccreditationCaseListResult,
  type AccreditationCaseRecord,
} from "@/lib/dal/accreditation";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import {
  decideAccreditationCaseSchema,
  fileAccreditationCaseSchema,
  getAccreditationCaseSchema,
  listAccreditationCasesSchema,
} from "@/lib/validation/accreditation";

export type { AccreditationCaseListResult, AccreditationCaseRecord } from "@/lib/dal/accreditation";

export type AccreditationActionErrorCode =
  | ActionErrorCode
  | "CONFLICT"
  | "NOT_FOUND";

export type AccreditationActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AccreditationActionErrorCode };

async function mapAccreditationAction<T>(
  run: () => Promise<AccreditationActionResult<T>>,
): Promise<AccreditationActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof AccreditationCaseScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (
      error instanceof AccreditationCaseNotFoundError ||
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

const fileAccreditationCaseInner = roleActionClient({
  schema: fileAccreditationCaseSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    fileAccreditationCase({ input, actorId: user.id }),
});

const decideAccreditationCaseInner = roleActionClient({
  schema: decideAccreditationCaseSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    decideAccreditationCase({ input, actorId: user.id }),
});

export async function fileAccreditationCaseAction(
  input: unknown,
): Promise<AccreditationActionResult<AccreditationCaseRecord>> {
  return mapAccreditationAction(() => fileAccreditationCaseInner(input));
}

export async function decideAccreditationCaseAction(
  input: unknown,
): Promise<AccreditationActionResult<AccreditationCaseRecord>> {
  return mapAccreditationAction(() => decideAccreditationCaseInner(input));
}

const listAccreditationCasesInner = roleActionClient({
  schema: listAccreditationCasesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listAccreditationCases(input),
});

const getAccreditationCaseInner = roleActionClient({
  schema: getAccreditationCaseSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getAccreditationCaseById(input.id);
    if (!record) {
      throw new AccreditationCaseNotFoundError();
    }
    return record;
  },
});

export async function listAccreditationCasesAction(
  input: unknown,
): Promise<AccreditationActionResult<AccreditationCaseListResult>> {
  return mapAccreditationAction(() => listAccreditationCasesInner(input));
}

export async function getAccreditationCaseAction(
  input: unknown,
): Promise<AccreditationActionResult<AccreditationCaseRecord>> {
  return mapAccreditationAction(() => getAccreditationCaseInner(input));
}

function fileFormValues(formData: FormData) {
  return {
    cooperativeId: formData.get("cooperativeId"),
    typeId: formData.get("typeId"),
    statusId: formData.get("statusId"),
    remarks: formData.get("remarks"),
  };
}

function decideFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    cooperativeId: formData.get("cooperativeId"),
    statusId: formData.get("statusId"),
    accreditationStatusId: formData.get("accreditationStatusId"),
    remarks: formData.get("remarks"),
  };
}

export async function fileAccreditationCaseFormAction(
  _previous: AccreditationActionResult<AccreditationCaseRecord> | null,
  formData: FormData,
): Promise<AccreditationActionResult<AccreditationCaseRecord>> {
  const result = await fileAccreditationCaseAction(fileFormValues(formData));
  if (result.ok) {
    redirect("/cooperatives/cases");
  }
  return result;
}

export async function decideAccreditationCaseFormAction(
  _previous: AccreditationActionResult<AccreditationCaseRecord> | null,
  formData: FormData,
): Promise<AccreditationActionResult<AccreditationCaseRecord>> {
  const result = await decideAccreditationCaseAction(decideFormValues(formData));
  if (result.ok) {
    redirect(`/cooperatives/cases/${result.data.id}`);
  }
  return result;
}
