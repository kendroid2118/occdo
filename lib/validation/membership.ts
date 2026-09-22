import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

const nonNegativeIntSchema = z.coerce.number().int().min(0).max(1_000_000);

/**
 * Male + female are not required to equal total until OCCDO confirms that rule.
 */
export const updateMembershipSchema = z.object({
  cooperativeId: nonEmptyStringSchema.max(64),
  totalMembers: nonNegativeIntSchema,
  maleMembers: nonNegativeIntSchema,
  femaleMembers: nonNegativeIntSchema,
});

export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;
