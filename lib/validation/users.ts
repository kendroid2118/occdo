import { z } from "zod";

import { AUTH_ROLES } from "@/lib/auth/roles";
import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((value) => value.toLowerCase());

const optionalNameSchema = z
  .string()
  .trim()
  .max(200)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const isActiveSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  if (value === true || value === "true" || value === "on" || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === "off" || value === "0") {
    return false;
  }
  return value;
}, z.boolean().default(true));

export const createManagedUserSchema = z.object({
  email: emailSchema,
  name: optionalNameSchema,
  password: nonEmptyStringSchema.min(8).max(128),
  role: z.enum(AUTH_ROLES),
  isActive: isActiveSchema,
});

export const updateManagedUserSchema = z.object({
  id: referenceIdSchema,
  name: optionalNameSchema,
  role: z.enum(AUTH_ROLES),
  isActive: isActiveSchema,
});

export const getManagedUserSchema = z.object({
  id: referenceIdSchema,
});

export const listManagedUsersSchema = z.object({});

export type CreateManagedUserInput = z.infer<typeof createManagedUserSchema>;
export type UpdateManagedUserInput = z.infer<typeof updateManagedUserSchema>;
export type GetManagedUserInput = z.infer<typeof getManagedUserSchema>;
