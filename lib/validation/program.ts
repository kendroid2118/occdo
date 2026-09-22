import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

const catalogCodeSchema = nonEmptyStringSchema.max(64);
const catalogNameSchema = nonEmptyStringSchema.max(255);

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const createCatalogItemSchema = z.object({
  code: catalogCodeSchema,
  name: catalogNameSchema,
  description: optionalDescriptionSchema,
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const listProgramCatalogsSchema = z.object({});

export type CreateCatalogItemInput = z.infer<typeof createCatalogItemSchema>;
