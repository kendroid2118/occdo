"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import {
  createServiceDelivery,
  listServiceDeliveries,
  type ServiceDeliveryListResult,
  type ServiceDeliveryRecord,
} from "@/lib/dal/service-deliveries";
import {
  createServiceDeliverySchema,
  listServiceDeliveriesSchema,
} from "@/lib/validation/service-delivery";

export type { ServiceDeliveryListResult, ServiceDeliveryRecord };

export type ServiceDeliveryActionErrorCode =
  | ActionErrorCode
  | "CONFLICT"
  | "NOT_FOUND";

export type ServiceDeliveryActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ServiceDeliveryActionErrorCode };

async function mapDeliveryAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<ServiceDeliveryActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof CooperativeNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CooperativeReferenceError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const createServiceDeliveryInner = roleActionClient({
  schema: createServiceDeliverySchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createServiceDelivery({ input, actorId: user.id }),
});

const listServiceDeliveriesInner = roleActionClient({
  schema: listServiceDeliveriesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listServiceDeliveries(input),
});

export async function createServiceDeliveryAction(
  input: unknown,
): Promise<ServiceDeliveryActionResult<ServiceDeliveryRecord>> {
  return mapDeliveryAction(() => createServiceDeliveryInner(input));
}

export async function listServiceDeliveriesAction(
  input: unknown,
): Promise<ServiceDeliveryActionResult<ServiceDeliveryListResult>> {
  return mapDeliveryAction(() => listServiceDeliveriesInner(input));
}

function createFormValues(formData: FormData) {
  return {
    cooperativeId: formData.get("cooperativeId"),
    serviceTypeId: formData.get("serviceTypeId"),
    programId: formData.get("programId"),
    deliveredAt: formData.get("deliveredAt"),
    remarks: formData.get("remarks"),
  };
}

export async function createServiceDeliveryFormAction(
  _previous: ServiceDeliveryActionResult<ServiceDeliveryRecord> | null,
  formData: FormData,
): Promise<ServiceDeliveryActionResult<ServiceDeliveryRecord>> {
  const result = await createServiceDeliveryAction(createFormValues(formData));
  if (result.ok) {
    redirect("/programs");
  }
  return result;
}
