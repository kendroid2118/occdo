"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import { CooperativeReferenceError } from "@/lib/dal/cooperatives";
import {
  TrainingEventNotFoundError,
  createTrainingEvent,
  getTrainingEventById,
  listTrainingEvents,
  updateTrainingEvent,
  type TrainingEventListResult,
  type TrainingEventRecord,
} from "@/lib/dal/training-events";
import {
  createTrainingEventSchema,
  getTrainingEventSchema,
  listTrainingEventsSchema,
  updateTrainingEventSchema,
} from "@/lib/validation/training-event";

export type { TrainingEventListResult, TrainingEventRecord };

export type TrainingEventActionErrorCode =
  | ActionErrorCode
  | "CONFLICT"
  | "NOT_FOUND";

export type TrainingEventActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: TrainingEventActionErrorCode };

async function mapTrainingEventAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<TrainingEventActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof TrainingEventNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CooperativeReferenceError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const createTrainingEventInner = roleActionClient({
  schema: createTrainingEventSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createTrainingEvent({ input, actorId: user.id }),
});

const updateTrainingEventInner = roleActionClient({
  schema: updateTrainingEventSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    updateTrainingEvent({ input, actorId: user.id }),
});

const getTrainingEventInner = roleActionClient({
  schema: getTrainingEventSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getTrainingEventById(input.id);
    if (!record) {
      throw new TrainingEventNotFoundError();
    }
    return record;
  },
});

const listTrainingEventsInner = roleActionClient({
  schema: listTrainingEventsSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listTrainingEvents(input),
});

export async function createTrainingEventAction(
  input: unknown,
): Promise<TrainingEventActionResult<TrainingEventRecord>> {
  return mapTrainingEventAction(() => createTrainingEventInner(input));
}

export async function updateTrainingEventAction(
  input: unknown,
): Promise<TrainingEventActionResult<TrainingEventRecord>> {
  return mapTrainingEventAction(() => updateTrainingEventInner(input));
}

export async function getTrainingEventAction(
  input: unknown,
): Promise<TrainingEventActionResult<TrainingEventRecord>> {
  return mapTrainingEventAction(() => getTrainingEventInner(input));
}

export async function listTrainingEventsAction(
  input: unknown,
): Promise<TrainingEventActionResult<TrainingEventListResult>> {
  return mapTrainingEventAction(() => listTrainingEventsInner(input));
}

function eventFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    title: formData.get("title"),
    kind: formData.get("kind"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    venue: formData.get("venue"),
    programId: formData.get("programId"),
    serviceTypeId: formData.get("serviceTypeId"),
    remarks: formData.get("remarks"),
  };
}

export async function createTrainingEventFormAction(
  _previous: TrainingEventActionResult<TrainingEventRecord> | null,
  formData: FormData,
): Promise<TrainingEventActionResult<TrainingEventRecord>> {
  const result = await createTrainingEventAction(eventFormValues(formData));
  if (result.ok) {
    redirect("/capacity-building");
  }
  return result;
}

export async function updateTrainingEventFormAction(
  _previous: TrainingEventActionResult<TrainingEventRecord> | null,
  formData: FormData,
): Promise<TrainingEventActionResult<TrainingEventRecord>> {
  const result = await updateTrainingEventAction(eventFormValues(formData));
  if (result.ok) {
    redirect("/capacity-building");
  }
  return result;
}
