import { z } from "zod";

import { nonEmptyStringSchema } from "@/lib/validation/common";

export const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: nonEmptyStringSchema.max(128),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
