const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const ACTION_MAX_ATTEMPTS = 60;

const attemptsByKey = new Map<string, number[]>();

export class RateLimitError extends Error {
  readonly code = "RATE_LIMITED" as const;

  constructor() {
    super("Too many requests");
    this.name = "RateLimitError";
  }
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

export async function assertActionRateLimit(identifier: string): Promise<void> {
  await assertRateLimit(identifier, ACTION_MAX_ATTEMPTS);
}

export async function assertLoginRateLimit(ip: string, email: string): Promise<void> {
  const ipKey = ip.trim() || "unknown";
  const emailKey = email.trim().toLowerCase() || "unknown";
  await assertRateLimit(`login:${ipKey}:${emailKey}`);
}

/** Test-only helper. Do not use in application code. */
export function resetRateLimitStateForTests(): void {
  attemptsByKey.clear();
}
