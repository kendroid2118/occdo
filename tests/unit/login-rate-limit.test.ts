import { beforeEach, describe, expect, it } from "vitest";

import {
  RateLimitError,
  assertLoginRateLimit,
  resetRateLimitStateForTests,
} from "@/lib/rate-limit";

describe("assertLoginRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
  });

  it("allows initial IP+email attempts and then throws RateLimitError", async () => {
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await expect(
        assertLoginRateLimit("127.0.0.1", "staff@example.invalid"),
      ).resolves.toBeUndefined();
    }

    await expect(
      assertLoginRateLimit("127.0.0.1", "staff@example.invalid"),
    ).rejects.toBeInstanceOf(RateLimitError);

    await expect(
      assertLoginRateLimit("10.0.0.2", "staff@example.invalid"),
    ).resolves.toBeUndefined();
  });
});
