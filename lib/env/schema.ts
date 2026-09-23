import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.enum(["true", "false"]).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SEED_DEMO_EMAIL: z.string().trim().email().optional(),
  SEED_DEMO_PASSWORD: z.string().min(12).optional(),
  DOCUMENT_STORAGE_DIR: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.string().trim().min(1).optional(),
  ),
  CDA_PORTAL_URL: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.string().trim().url().optional(),
  ),
  TEST_LOGIN_RATE_LIMIT_MAX: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(5).max(120).optional(),
  ),
  TEST_ACTION_RATE_LIMIT_MAX: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(60).max(500).optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  const env = envSchema.parse(source);
  const testOverridePermitted =
    env.NODE_ENV === "test" ||
    (env.NODE_ENV !== "production" && source.PLAYWRIGHT === "1");
  if (env.TEST_LOGIN_RATE_LIMIT_MAX != null && !testOverridePermitted) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["TEST_LOGIN_RATE_LIMIT_MAX"],
        message: "TEST_LOGIN_RATE_LIMIT_MAX is only allowed in automated tests",
      },
    ]);
  }
  if (env.TEST_ACTION_RATE_LIMIT_MAX != null && !testOverridePermitted) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ["TEST_ACTION_RATE_LIMIT_MAX"],
        message: "TEST_ACTION_RATE_LIMIT_MAX is only allowed in automated tests",
      },
    ]);
  }
  return env;
}
