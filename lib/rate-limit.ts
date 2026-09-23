const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
export const ACTION_MAX_ATTEMPTS = 60;
export const LOGIN_MAX_ATTEMPTS = 5;
const TEST_LOGIN_MAX_ATTEMPTS_CAP = 120;
const TEST_ACTION_MAX_ATTEMPTS_CAP = 500;

const attemptsByKey = new Map<string, number[]>();

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED" as const;

  constructor() {
    super("Too many requests");
    this.name = "RateLimitError";
  }
}

export class RateLimitConfigError extends Error {
  readonly code = "RATE_LIMIT_CONFIG" as const;

  constructor(message: string) {
    super(message);
    this.name = "RateLimitConfigError";
  }
}

function isTestRateLimitOverridePermitted(
  source: NodeJS.ProcessEnv = process.env,
): boolean {
  const nodeEnv = source.NODE_ENV;
  return nodeEnv === "test" || (nodeEnv !== "production" && source.PLAYWRIGHT === "1");
}

/** Resolves the login attempt cap. Default is 5. A higher value requires an explicit test-only env. */
export function resolveLoginMaxAttempts(
  source: NodeJS.ProcessEnv = process.env,
): number {
  const raw = source.TEST_LOGIN_RATE_LIMIT_MAX;
  if (raw == null || raw.trim() === "") {
    return LOGIN_MAX_ATTEMPTS;
  }

  if (!isTestRateLimitOverridePermitted(source)) {
    throw new RateLimitConfigError(
      "TEST_LOGIN_RATE_LIMIT_MAX is only allowed in automated tests",
    );
  }

  const parsed = Number.parseInt(raw, 10);
  if (
    !Number.isInteger(parsed) ||
    parsed < LOGIN_MAX_ATTEMPTS ||
    parsed > TEST_LOGIN_MAX_ATTEMPTS_CAP
  ) {
    throw new RateLimitConfigError("TEST_LOGIN_RATE_LIMIT_MAX is invalid");
  }

  return parsed;
}

function prune(now: number, stamps: number[]): number[] {
  return stamps.filter((stamp) => now - stamp < WINDOW_MS);
}

export async function assertRateLimit(
  identifier: string,
  maxAttempts: number = MAX_ATTEMPTS,
): Promise<void> {
  const key = identifier.trim().toLowerCase();
  if (!key) {
    throw new RateLimitError();
  }

  const now = Date.now();
  const next = prune(now, attemptsByKey.get(key) ?? []);
  if (next.length >= maxAttempts) {
    attemptsByKey.set(key, next);
    throw new RateLimitError();
  }

  next.push(now);
  attemptsByKey.set(key, next);
}

export function resolveActionMaxAttempts(
  source: NodeJS.ProcessEnv = process.env,
): number {
  const raw = source.TEST_ACTION_RATE_LIMIT_MAX;
  if (raw == null || raw.trim() === "") {
    return ACTION_MAX_ATTEMPTS;
  }

  if (!isTestRateLimitOverridePermitted(source)) {
    throw new RateLimitConfigError(
      "TEST_ACTION_RATE_LIMIT_MAX is only allowed in automated tests",
    );
  }

  const parsed = Number.parseInt(raw, 10);
  if (
    !Number.isInteger(parsed) ||
    parsed < ACTION_MAX_ATTEMPTS ||
    parsed > TEST_ACTION_MAX_ATTEMPTS_CAP
  ) {
    throw new RateLimitConfigError("TEST_ACTION_RATE_LIMIT_MAX is invalid");
  }

  return parsed;
}

export async function assertActionRateLimit(identifier: string): Promise<void> {
  await assertRateLimit(identifier, resolveActionMaxAttempts());
}

export async function assertLoginRateLimit(ip: string, email: string): Promise<void> {
  const ipKey = ip.trim() || "unknown";
  const emailKey = email.trim().toLowerCase() || "unknown";
  await assertRateLimit(`login:${ipKey}:${emailKey}`, resolveLoginMaxAttempts());
}

/** Test-only helper. Do not use in application code. */
export function resetRateLimitStateForTests(): void {
  attemptsByKey.clear();
}
