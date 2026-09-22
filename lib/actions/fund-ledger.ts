"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  FundLedgerConflictError,
  FundLedgerParentNotFoundError,
  FundLedgerScopeError,
  FundLedgerTransitionError,
  createFundLedgerEntry,
  getFundLedgerSummary,
  listFundLedgerEntries,
  type FundLedgerEntryRecord,
  type FundLedgerSummary,
} from "@/lib/dal/fund-ledger";
import {
  createFundLedgerEntrySchema,
  listFundLedgerEntriesSchema,
} from "@/lib/validation/fund-ledger";

export type { FundLedgerEntryRecord, FundLedgerSummary };

export type FundLedgerActionErrorCode = ActionErrorCode | "CONFLICT" | "NOT_FOUND";

export type FundLedgerActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: FundLedgerActionErrorCode };

async function mapFundLedgerAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<FundLedgerActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof FundLedgerScopeError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    if (error instanceof FundLedgerParentNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof FundLedgerTransitionError) {
      return { ok: false, code: "VALIDATION" };
    }
    if (error instanceof FundLedgerConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const createFundLedgerEntryInner = roleActionClient({
  schema: createFundLedgerEntrySchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createFundLedgerEntry({ input, actorId: user.id }),
});

const listFundLedgerEntriesInner = roleActionClient({
  schema: listFundLedgerEntriesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listFundLedgerEntries(input),
});

const getFundLedgerSummaryInner = roleActionClient({
  schema: listFundLedgerEntriesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => getFundLedgerSummary(input),
});

export async function createFundLedgerEntryAction(
  input: unknown,
): Promise<FundLedgerActionResult<FundLedgerEntryRecord>> {
  return mapFundLedgerAction(() => createFundLedgerEntryInner(input));
}

export async function listFundLedgerEntriesAction(
  input: unknown,
): Promise<FundLedgerActionResult<FundLedgerEntryRecord[]>> {
  return mapFundLedgerAction(() => listFundLedgerEntriesInner(input));
}

export async function getFundLedgerSummaryAction(
  input: unknown,
): Promise<FundLedgerActionResult<FundLedgerSummary>> {
  return mapFundLedgerAction(() => getFundLedgerSummaryInner(input));
}

export async function createFundLedgerEntryFormAction(
  _previous: FundLedgerActionResult<FundLedgerEntryRecord> | null,
  formData: FormData,
): Promise<FundLedgerActionResult<FundLedgerEntryRecord>> {
  const assistanceRecordId = formData.get("assistanceRecordId");
  const result = await createFundLedgerEntryAction({
    assistanceRecordId,
    cooperativeId: formData.get("cooperativeId"),
    entryDate: formData.get("entryDate"),
    amount: formData.get("amount"),
    entryKind: formData.get("entryKind"),
    remarks: formData.get("remarks"),
  });
  if (result.ok && typeof assistanceRecordId === "string") {
    redirect(`/financial-assistance/${assistanceRecordId}`);
  }
  return result;
}
