"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  AssistanceCatalogConflictError,
  AssistanceRecordNotFoundError,
  AssistanceScopeError,
  AssistanceTransitionError,
  approveAssistanceRecord,
  createAssistanceRecord,
  createAssistanceType,
  getAssistanceRecordById,
  listAssistanceRecords,
  releaseAssistanceRecord,
  updateAssistanceAmount,
  type AssistanceRecord,
  type AssistanceRecordListResult,
} from "@/lib/dal/assistance";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { FundLedgerConflictError } from "@/lib/dal/fund-ledger";
import {
  listActiveAssistanceStatuses,
  listActiveAssistanceTypes,
  type ReferenceRecord,
} from "@/lib/dal/reference";
import {
  createAssistanceRecordSchema,
  getAssistanceRecordSchema,
  listAssistanceCatalogsSchema,
  listAssistanceRecordsSchema,
  transitionAssistanceRecordSchema,
  updateAssistanceAmountSchema,
} from "@/lib/validation/assistance";
import { createCatalogItemSchema } from "@/lib/validation/program";

export type { AssistanceRecord, AssistanceRecordListResult, ReferenceRecord };

export type AssistanceCatalogs = {
  types: ReferenceRecord[];
  statuses: ReferenceRecord[];
};

export type AssistanceActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type AssistanceActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AssistanceActionErrorCode };

async function mapAssistanceAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<AssistanceActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof AssistanceScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (
      error instanceof AssistanceRecordNotFoundError ||
      error instanceof CooperativeNotFoundError
    ) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (
      error instanceof AssistanceTransitionError ||
      error instanceof CooperativeReferenceError
    ) {
      return { ok: false, code: "VALIDATION" };
    }
    if (error instanceof AssistanceCatalogConflictError || error instanceof FundLedgerConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const createAssistanceTypeInner = roleActionClient({
  schema: createCatalogItemSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createAssistanceType({ input, actorId: user.id }),
});

const createAssistanceRecordInner = roleActionClient({
  schema: createAssistanceRecordSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createAssistanceRecord({ input, actorId: user.id }),
});

const updateAssistanceAmountInner = roleActionClient({
  schema: updateAssistanceAmountSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    updateAssistanceAmount({ input, actorId: user.id }),
});

const approveAssistanceRecordInner = roleActionClient({
  schema: transitionAssistanceRecordSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    approveAssistanceRecord({ input, actorId: user.id }),
});

const releaseAssistanceRecordInner = roleActionClient({
  schema: transitionAssistanceRecordSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    releaseAssistanceRecord({ input, actorId: user.id }),
});

const listAssistanceRecordsInner = roleActionClient({
  schema: listAssistanceRecordsSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listAssistanceRecords(input),
});

const getAssistanceRecordInner = roleActionClient({
  schema: getAssistanceRecordSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getAssistanceRecordById(input.id);
    if (!record) {
      throw new AssistanceRecordNotFoundError();
    }
    return record;
  },
});

export const listAssistanceCatalogsAction = roleActionClient({
  schema: listAssistanceCatalogsSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<AssistanceCatalogs> => {
    const [types, statuses] = await Promise.all([
      listActiveAssistanceTypes(),
      listActiveAssistanceStatuses(),
    ]);
    return { types, statuses };
  },
});

export async function createAssistanceTypeAction(
  input: unknown,
): Promise<AssistanceActionResult<ReferenceRecord>> {
  return mapAssistanceAction(() => createAssistanceTypeInner(input));
}

export async function createAssistanceRecordAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  return mapAssistanceAction(() => createAssistanceRecordInner(input));
}

export async function updateAssistanceAmountAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  return mapAssistanceAction(() => updateAssistanceAmountInner(input));
}

export async function approveAssistanceRecordAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  return mapAssistanceAction(() => approveAssistanceRecordInner(input));
}

export async function releaseAssistanceRecordAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  return mapAssistanceAction(() => releaseAssistanceRecordInner(input));
}

export async function listAssistanceRecordsAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecordListResult>> {
  return mapAssistanceAction(() => listAssistanceRecordsInner(input));
}

export async function getAssistanceRecordAction(
  input: unknown,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  return mapAssistanceAction(() => getAssistanceRecordInner(input));
}

function createFormValues(formData: FormData) {
  return {
    cooperativeId: formData.get("cooperativeId"),
    assistanceTypeId: formData.get("assistanceTypeId"),
    amount: formData.get("amount"),
    requestedAt: formData.get("requestedAt"),
    fundSource: formData.get("fundSource"),
    remarks: formData.get("remarks"),
  };
}

export async function createAssistanceRecordFormAction(
  _previous: AssistanceActionResult<AssistanceRecord> | null,
  formData: FormData,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  const result = await createAssistanceRecordAction(createFormValues(formData));
  if (result.ok) {
    redirect("/financial-assistance");
  }
  return result;
}

export async function updateAssistanceAmountFormAction(
  _previous: AssistanceActionResult<AssistanceRecord> | null,
  formData: FormData,
): Promise<AssistanceActionResult<AssistanceRecord>> {
  const id = formData.get("id");
  const result = await updateAssistanceAmountAction({
    id,
    cooperativeId: formData.get("cooperativeId"),
    amount: formData.get("amount"),
  });
  if (result.ok && typeof id === "string") {
    redirect(`/financial-assistance/${id}`);
  }
  return result;
}

export async function approveAssistanceRecordFormAction(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id");
  const result = await approveAssistanceRecordAction({
    id,
    cooperativeId: formData.get("cooperativeId"),
  });
  if (result.ok && typeof id === "string") {
    redirect(`/financial-assistance/${id}`);
  }
}

export async function releaseAssistanceRecordFormAction(
  formData: FormData,
): Promise<void> {
  const id = formData.get("id");
  const result = await releaseAssistanceRecordAction({
    id,
    cooperativeId: formData.get("cooperativeId"),
  });
  if (result.ok && typeof id === "string") {
    redirect(`/financial-assistance/${id}`);
  }
}
