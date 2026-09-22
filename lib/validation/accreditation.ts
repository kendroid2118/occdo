import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const optionalDateSchema = z
  .union([
    z.string().datetime(),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.date(),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => {
    if (value == null || value === "") {
      return null;
    }
    return value instanceof Date ? value : new Date(value);
  });

export const fileAccreditationCaseSchema = z.object({
  cooperativeId: referenceIdSchema,
  typeId: referenceIdSchema,
  statusId: referenceIdSchema,
  filedAt: optionalDateSchema,
  remarks: optionalLongTextSchema,
});

export const decideAccreditationCaseSchema = z.object({
  id: referenceIdSchema,
  cooperativeId: referenceIdSchema,
  statusId: referenceIdSchema,
  accreditationStatusId: referenceIdSchema,
  decidedAt: optionalDateSchema,
  remarks: optionalLongTextSchema,
});

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

export const listAccreditationCasesSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  statusId: optionalFilterIdSchema,
});

export const getAccreditationCaseSchema = z.object({
  id: referenceIdSchema,
});

export type FileAccreditationCaseInput = z.infer<typeof fileAccreditationCaseSchema>;
export type DecideAccreditationCaseInput = z.infer<
  typeof decideAccreditationCaseSchema
>;
export type ListAccreditationCasesInput = z.infer<
  typeof listAccreditationCasesSchema
>;
export type GetAccreditationCaseInput = z.infer<typeof getAccreditationCaseSchema>;
