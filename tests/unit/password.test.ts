import { describe, expect, it } from "vitest";

import { hashPassword, verifyPasswordAgainstKnownHash } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies a hash and rejects a mismatch without exposing the secret", async () => {
    const hash = await hashPassword("correct-password-value");
    expect(hash.startsWith("$2")).toBe(true);
    await expect(
      verifyPasswordAgainstKnownHash("correct-password-value", hash),
    ).resolves.toBe(true);
    await expect(
      verifyPasswordAgainstKnownHash("wrong-password-value", hash),
    ).resolves.toBe(false);
  });
});
