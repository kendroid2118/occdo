import { z } from "zod";

import { CATALOG_KINDS } from "@/lib/settings/access";
import { createCatalogItemSchema } from "@/lib/validation/program";
import { nonEmptyStringSchema } from "@/lib/validation/common";

const optionalFrequencySchema = z
  .string()
  .trim()
  .max(64)
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

export const catalogKindSchema = z.enum(CATALOG_KINDS);

export const listCatalogItemsSchema = z.object({
  kind: catalogKindSchema,
});

export const getCatalogItemSchema = z.object({
  kind: catalogKindSchema,
  id: nonEmptyStringSchema.max(64),
});

export const createCatalogAdminItemSchema = createCatalogItemSchema.extend({
  kind: catalogKindSchema,
  frequency: optionalFrequencySchema,
  isActive: isActiveSchema,
});

export const updateCatalogAdminItemSchema = createCatalogItemSchema.extend({
  kind: catalogKindSchema,
  id: nonEmptyStringSchema.max(64),
  frequency: optionalFrequencySchema,
  isActive: isActiveSchema,
});

export const cdaPortalUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || /^https?:\/\/.+/i.test(value), {
    message: "CDA Portal URL must be an http(s) URL or empty",
  });

export const upsertCdaPortalUrlSchema = z.object({
  value: cdaPortalUrlSchema,
});

export type ListCatalogItemsInput = z.infer<typeof listCatalogItemsSchema>;
export type GetCatalogItemInput = z.infer<typeof getCatalogItemSchema>;
export type CreateCatalogAdminItemInput = z.infer<typeof createCatalogAdminItemSchema>;
export type UpdateCatalogAdminItemInput = z.infer<typeof updateCatalogAdminItemSchema>;
export type UpsertCdaPortalUrlInput = z.infer<typeof upsertCdaPortalUrlSchema>;
