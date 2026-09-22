import { z } from "zod";

import { createCatalogItemSchema } from "@/lib/validation/program";

const optionalFrequencySchema = z
  .string()
  .trim()
  .max(64)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

export const createComplianceRequirementSchema = createCatalogItemSchema.extend({
  frequency: optionalFrequencySchema,
});

export const listComplianceRequirementsSchema = z.object({});

export const getComplianceRequirementSchema = z.object({
  id: z.string().trim().min(1).max(64),
});

export type CreateComplianceRequirementInput = z.infer<
  typeof createComplianceRequirementSchema
>;
