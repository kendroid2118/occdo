/**
 * Rate limiting is implemented in M1 (OCCDO-012).
 * Fail closed: do not treat an unimplemented limiter as allow-all.
 */
export async function assertRateLimit(identifier: string): Promise<void> {
  if (!identifier) {
    throw new Error("Rate limiting is not implemented yet (M1 / OCCDO-012).");
  }
  throw new Error("Rate limiting is not implemented yet (M1 / OCCDO-012).");
}
