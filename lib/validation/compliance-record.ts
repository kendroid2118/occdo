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

const requiredDateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

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

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

export const createComplianceRecordSchema = z.object({
  cooperativeId: referenceIdSchema,
  requirementId: referenceIdSchema,
  reportingPeriod: nonEmptyStringSchema.max(32),
  dueDate: requiredDateSchema,
  submittedDate: optionalDateSchema,
  remarks: optionalLongTextSchema,
});

export const verifyComplianceRecordSchema = z.object({
  id: referenceIdSchema,
  cooperativeId: referenceIdSchema,
});

export const getComplianceRecordSchema = z.object({
  id: referenceIdSchema,
});

export const listComplianceRecordsSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  cooperativeId: optionalFilterIdSchema,
  requirementId: optionalFilterIdSchema,
  statusId: optionalFilterIdSchema,
});

export const listComplianceCatalogsSchema = z.object({});

export type CreateComplianceRecordInput = z.infer<typeof createComplianceRecordSchema>;
export type VerifyComplianceRecordInput = z.infer<typeof verifyComplianceRecordSchema>;
export type ListComplianceRecordsInput = z.infer<typeof listComplianceRecordsSchema>;
