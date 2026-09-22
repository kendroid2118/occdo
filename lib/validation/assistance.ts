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

const optionalFundSourceSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const requiredDateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

export const assistanceAmountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => (typeof value === "number" ? value.toFixed(2) : value.trim()))
  .refine((value) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value), {
    message: "Amount must be a number with up to two decimal places",
  })
  .refine((value) => Number(value) > 0, { message: "Amount must be greater than zero" })
  .refine((value) => Number(value) <= 999_999_999.99, { message: "Amount is too large" });

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

export const createAssistanceRecordSchema = z.object({
  cooperativeId: referenceIdSchema,
  assistanceTypeId: referenceIdSchema,
  amount: assistanceAmountSchema,
  requestedAt: requiredDateSchema,
  fundSource: optionalFundSourceSchema,
  remarks: optionalLongTextSchema,
});

export const updateAssistanceAmountSchema = z.object({
  id: referenceIdSchema,
  cooperativeId: referenceIdSchema,
  amount: assistanceAmountSchema,
});

export const transitionAssistanceRecordSchema = z.object({
  id: referenceIdSchema,
  cooperativeId: referenceIdSchema,
});

export const getAssistanceRecordSchema = z.object({
  id: referenceIdSchema,
});

export const listAssistanceRecordsSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  cooperativeId: optionalFilterIdSchema,
  assistanceTypeId: optionalFilterIdSchema,
  statusId: optionalFilterIdSchema,
});

export const listAssistanceCatalogsSchema = z.object({});

export type CreateAssistanceRecordInput = z.infer<typeof createAssistanceRecordSchema>;
export type UpdateAssistanceAmountInput = z.infer<typeof updateAssistanceAmountSchema>;
export type TransitionAssistanceRecordInput = z.infer<
  typeof transitionAssistanceRecordSchema
>;
export type ListAssistanceRecordsInput = z.infer<typeof listAssistanceRecordsSchema>;
