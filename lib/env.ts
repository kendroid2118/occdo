import "server-only";

import { parseEnv, type Env } from "@/lib/env/schema";

export type { Env };

export const env: Env = parseEnv({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  SEED_DEMO_EMAIL: process.env.SEED_DEMO_EMAIL,
  SEED_DEMO_PASSWORD: process.env.SEED_DEMO_PASSWORD,
  DOCUMENT_STORAGE_DIR: process.env.DOCUMENT_STORAGE_DIR,
});
