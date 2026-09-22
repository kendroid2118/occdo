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

const optionalProgramIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional().nullable(),
);

const requiredDateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

const optionalFilterDateSchema = z.preprocess((value) => {
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
}, z.date().optional());

export const createServiceDeliverySchema = z.object({
  cooperativeId: referenceIdSchema,
  serviceTypeId: referenceIdSchema,
  programId: optionalProgramIdSchema,
  deliveredAt: requiredDateSchema,
  remarks: optionalLongTextSchema,
});

export const listServiceDeliveriesSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  cooperativeId: optionalFilterIdSchema,
  serviceTypeId: optionalFilterIdSchema,
  deliveredFrom: optionalFilterDateSchema,
  deliveredTo: optionalFilterDateSchema,
});

export type CreateServiceDeliveryInput = z.infer<typeof createServiceDeliverySchema>;
export type ListServiceDeliveriesInput = z.infer<typeof listServiceDeliveriesSchema>;
