import { z } from "zod";

/** Shared Zod helpers. Domain schemas start in M1/M2. */
export const nonEmptyStringSchema = z.string().trim().min(1);
