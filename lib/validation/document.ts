import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

const optionalReportingPeriodSchema = z
  .string()
  .trim()
  .max(32)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

function isByteArray(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

export const uploadDocumentSchema = z.object({
  cooperativeId: referenceIdSchema,
  documentTypeId: referenceIdSchema,
  reportingPeriod: optionalReportingPeriodSchema,
  fileName: z.string().max(512),
  fileBytes: z.custom<Uint8Array>(isByteArray),
});

export const getDocumentSchema = z.object({
  id: referenceIdSchema,
});

export const listDocumentsSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  cooperativeId: optionalFilterIdSchema,
  documentTypeId: optionalFilterIdSchema,
});

export const listDocumentCatalogsSchema = z.object({});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsSchema>;
