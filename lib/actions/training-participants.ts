"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import { TrainingEventNotFoundError } from "@/lib/dal/training-events";
import {
  createTrainingParticipant,
  listParticipantsByEventId,
  listTrainingEventsByCooperativeId,
  type CooperativeTrainingEventRecord,
  type TrainingParticipantListRecord,
} from "@/lib/dal/training-participants";
import {
  createTrainingParticipantSchema,
  listEventsByCooperativeSchema,
  listParticipantsByEventSchema,
} from "@/lib/validation/training-participant";

export type { CooperativeTrainingEventRecord, TrainingParticipantListRecord };

export type TrainingParticipantActionErrorCode =
  | ActionErrorCode
  | "CONFLICT"
  | "NOT_FOUND";

export type TrainingParticipantActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: TrainingParticipantActionErrorCode };

async function mapParticipantAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<TrainingParticipantActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (
      error instanceof TrainingEventNotFoundError ||
      error instanceof CooperativeNotFoundError
    ) {
      return { ok: false, code: "NOT_FOUND" };
    }
    throw error;
  }
}

const createTrainingParticipantInner = roleActionClient({
  schema: createTrainingParticipantSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createTrainingParticipant({ input, actorId: user.id }),
});

const listParticipantsByEventInner = roleActionClient({
  schema: listParticipantsByEventSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listParticipantsByEventId(input.trainingEventId),
});

const listEventsByCooperativeInner = roleActionClient({
  schema: listEventsByCooperativeSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) =>
    listTrainingEventsByCooperativeId(input.cooperativeId),
});

export async function createTrainingParticipantAction(
  input: unknown,
): Promise<TrainingParticipantActionResult<TrainingParticipantListRecord>> {
  return mapParticipantAction(() => createTrainingParticipantInner(input));
}

export async function listParticipantsByEventAction(
  input: unknown,
): Promise<TrainingParticipantActionResult<TrainingParticipantListRecord[]>> {
  return mapParticipantAction(() => listParticipantsByEventInner(input));
}

export async function listTrainingEventsByCooperativeAction(
  input: unknown,
): Promise<TrainingParticipantActionResult<CooperativeTrainingEventRecord[]>> {
  return mapParticipantAction(() => listEventsByCooperativeInner(input));
}

function participantFormValues(formData: FormData) {
  return {
    trainingEventId: formData.get("trainingEventId"),
    cooperativeId: formData.get("cooperativeId"),
    fullName: formData.get("fullName"),
    attendanceStatus: formData.get("attendanceStatus"),
    contactNumber: formData.get("contactNumber"),
  };
}

export async function createTrainingParticipantFormAction(
  _previous: TrainingParticipantActionResult<TrainingParticipantListRecord> | null,
  formData: FormData,
): Promise<TrainingParticipantActionResult<TrainingParticipantListRecord>> {
  const values = participantFormValues(formData);
  const result = await createTrainingParticipantAction(values);
  if (result.ok && typeof values.trainingEventId === "string") {
    redirect(`/capacity-building/${values.trainingEventId}`);
  }
  return result;
}
