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

const checkboxSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value === true || value === "on" || value === "true" || value === "1";
}, z.boolean());

export const officerWriteSchema = z.object({
  cooperativeId: referenceIdSchema,
  positionId: referenceIdSchema,
  fullName: nonEmptyStringSchema.max(200),
  contactNumber: optionalTextSchema,
  email: optionalEmailSchema,
  isPrimaryContact: checkboxSchema.default(false),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
  isActive: checkboxSchema.default(true),
  remarks: optionalLongTextSchema,
});

export const createOfficerSchema = officerWriteSchema;

export const updateOfficerSchema = officerWriteSchema.extend({
  id: referenceIdSchema,
});

export const listOfficersSchema = z.object({
  cooperativeId: referenceIdSchema,
});

export const deleteOfficerSchema = z.object({
  id: referenceIdSchema,
  cooperativeId: referenceIdSchema,
});

export type CreateOfficerInput = z.infer<typeof createOfficerSchema>;
export type UpdateOfficerInput = z.infer<typeof updateOfficerSchema>;
export type ListOfficersInput = z.infer<typeof listOfficersSchema>;
export type DeleteOfficerInput = z.infer<typeof deleteOfficerSchema>;
