"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import type { CooperativeRecord } from "@/lib/dal/cooperatives";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import { updateCooperativeMembership } from "@/lib/dal/membership";
import { updateMembershipSchema } from "@/lib/validation/membership";

export type MembershipActionErrorCode = ActionErrorCode | "NOT_FOUND";

export type MembershipActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: MembershipActionErrorCode };

const updateMembershipInner = roleActionClient({
  schema: updateMembershipSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    updateCooperativeMembership({ input, actorId: user.id }),
});

export async function updateMembershipAction(
  input: unknown,
): Promise<MembershipActionResult<CooperativeRecord>> {
  try {
    return await updateMembershipInner(input);
  } catch (error: unknown) {
    if (error instanceof CooperativeNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    throw error;
  }
}

export async function updateMembershipFormAction(
  _previous: MembershipActionResult<CooperativeRecord> | null,
  formData: FormData,
): Promise<MembershipActionResult<CooperativeRecord>> {
  const cooperativeId = formData.get("cooperativeId");
  const result = await updateMembershipAction({
    cooperativeId,
    totalMembers: formData.get("totalMembers"),
    maleMembers: formData.get("maleMembers"),
    femaleMembers: formData.get("femaleMembers"),
  });
  if (result.ok && typeof cooperativeId === "string") {
    redirect(`/cooperatives/${cooperativeId}`);
  }
  return result;
}
