import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

export const TRAINING_KINDS = ["TRAINING", "SEMINAR", "ORIENTATION"] as const;

export type TrainingKindValue = (typeof TRAINING_KINDS)[number];

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalCatalogIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional().nullable(),
);

const optionalLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const requiredDateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

const optionalDateSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string") {
    return new Date(value);
  }
  return value;
}, z.date().optional().nullable());

const optionalKindSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.enum(TRAINING_KINDS).optional(),
);

const eventWriteSchema = z
  .object({
    title: nonEmptyStringSchema.max(255),
    kind: z.enum(TRAINING_KINDS),
    startAt: requiredDateSchema,
    endAt: optionalDateSchema,
    venue: nonEmptyStringSchema.max(255),
    programId: optionalCatalogIdSchema,
    serviceTypeId: optionalCatalogIdSchema,
    remarks: optionalLongTextSchema,
  })
  .refine(
    (value) => value.endAt == null || value.endAt.getTime() >= value.startAt.getTime(),
    { message: "End date must be on or after the start date", path: ["endAt"] },
  );

export const createTrainingEventSchema = eventWriteSchema;

export const updateTrainingEventSchema = eventWriteSchema.and(
  z.object({ id: referenceIdSchema }),
);

export const getTrainingEventSchema = z.object({
  id: referenceIdSchema,
});

export const listTrainingEventsSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  kind: optionalKindSchema,
});

export type CreateTrainingEventInput = z.infer<typeof createTrainingEventSchema>;
export type UpdateTrainingEventInput = z.infer<typeof updateTrainingEventSchema>;
export type ListTrainingEventsInput = z.infer<typeof listTrainingEventsSchema>;
export type GetTrainingEventInput = z.infer<typeof getTrainingEventSchema>;
