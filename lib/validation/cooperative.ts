import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalTextSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const optionalLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const optionalEmailSchema = z
  .union([z.string().trim().email().max(254), z.literal(""), z.null()])
  .optional()
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

const nonNegativeIntSchema = z.coerce.number().int().min(0).max(1_000_000);

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

const optionalSearchSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  },
  z.string().max(200).optional(),
);

export const cooperativeWriteSchema = z.object({
  cooperativeCode: nonEmptyStringSchema.max(64),
  registrationNumber: z
    .string()
    .trim()
    .max(64)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  name: nonEmptyStringSchema.max(200),
  acronym: optionalTextSchema,
  typeId: referenceIdSchema,
  sectorId: referenceIdSchema,
  address: nonEmptyStringSchema.max(500),
  barangayId: referenceIdSchema,
  contactPerson: nonEmptyStringSchema.max(200),
  contactNumber: nonEmptyStringSchema.max(64),
  email: optionalEmailSchema,
  dateRegistered: optionalDateSchema,
  dateAccredited: optionalDateSchema,
  accreditationStatusId: referenceIdSchema,
  statusId: referenceIdSchema,
  totalMembers: nonNegativeIntSchema.default(0),
  maleMembers: nonNegativeIntSchema.default(0),
  femaleMembers: nonNegativeIntSchema.default(0),
  remarks: optionalLongTextSchema,
});

export const createCooperativeSchema = cooperativeWriteSchema;

export const updateCooperativeSchema = cooperativeWriteSchema.extend({
  id: nonEmptyStringSchema.max(64),
});

export const getCooperativeSchema = z.object({
  id: nonEmptyStringSchema.max(64),
});

export const listCooperativesSchema = z.object({
  page: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).default(1),
  ),
  pageSize: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(20),
  ),
  search: optionalSearchSchema,
  typeId: optionalFilterIdSchema,
  sectorId: optionalFilterIdSchema,
  barangayId: optionalFilterIdSchema,
  statusId: optionalFilterIdSchema,
  accreditationStatusId: optionalFilterIdSchema,
  sortBy: z
    .enum(["name", "cooperativeCode", "createdAt"])
    .default("name"),
  sortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export type CreateCooperativeInput = z.infer<typeof createCooperativeSchema>;
export type UpdateCooperativeInput = z.infer<typeof updateCooperativeSchema>;
export type GetCooperativeInput = z.infer<typeof getCooperativeSchema>;
export type ListCooperativesInput = z.infer<typeof listCooperativesSchema>;
