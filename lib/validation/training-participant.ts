import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

export const ATTENDANCE_STATUSES = ["REGISTERED", "PRESENT", "ABSENT"] as const;

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalCooperativeIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional().nullable(),
);

const optionalContactSchema = z
  .string()
  .trim()
  .max(50)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const createTrainingParticipantSchema = z.object({
  trainingEventId: referenceIdSchema,
  cooperativeId: optionalCooperativeIdSchema,
  fullName: nonEmptyStringSchema.max(255),
  attendanceStatus: z.enum(ATTENDANCE_STATUSES).default("REGISTERED"),
  contactNumber: optionalContactSchema,
});

export const listParticipantsByEventSchema = z.object({
  trainingEventId: referenceIdSchema,
});

export const listEventsByCooperativeSchema = z.object({
  cooperativeId: referenceIdSchema,
});

export type CreateTrainingParticipantInput = z.infer<
  typeof createTrainingParticipantSchema
>;
export type ListParticipantsByEventInput = z.infer<
  typeof listParticipantsByEventSchema
>;
export type ListEventsByCooperativeInput = z.infer<
  typeof listEventsByCooperativeSchema
>;
