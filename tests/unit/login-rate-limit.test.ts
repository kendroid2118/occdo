import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  ACTION_MAX_ATTEMPTS,
  LOGIN_MAX_ATTEMPTS,
  RateLimitConfigError,
  RateLimitError,
  assertLoginRateLimit,
  resetRateLimitStateForTests,
  resolveActionMaxAttempts,
  resolveLoginMaxAttempts,
} from "@/lib/rate-limit";

describe("assertLoginRateLimit", () => {
  const originalOverride = process.env.TEST_LOGIN_RATE_LIMIT_MAX;
  const originalPlaywright = process.env.PLAYWRIGHT;

  beforeEach(() => {
    resetRateLimitStateForTests();
    delete process.env.TEST_LOGIN_RATE_LIMIT_MAX;
    delete process.env.PLAYWRIGHT;
  });

  afterEach(() => {
    if (originalOverride == null) {
      delete process.env.TEST_LOGIN_RATE_LIMIT_MAX;
    } else {
      process.env.TEST_LOGIN_RATE_LIMIT_MAX = originalOverride;
    }
    if (originalPlaywright == null) {
      delete process.env.PLAYWRIGHT;
    } else {
      process.env.PLAYWRIGHT = originalPlaywright;
    }
  });

  it("allows 5 IP+email attempts by default and then throws RateLimitError", async () => {
    for (let attempt = 0; attempt < LOGIN_MAX_ATTEMPTS; attempt += 1) {
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

  it("honors an explicit test-only override without disabling the limiter", async () => {
    process.env.TEST_LOGIN_RATE_LIMIT_MAX = "8";

    for (let attempt = 0; attempt < 8; attempt += 1) {
      await expect(
        assertLoginRateLimit("127.0.0.1", "staff@example.invalid"),
      ).resolves.toBeUndefined();
    }

    await expect(
      assertLoginRateLimit("127.0.0.1", "staff@example.invalid"),
    ).rejects.toBeInstanceOf(RateLimitError);
  });
});

describe("resolveLoginMaxAttempts", () => {
  it("defaults to 5 when no override is set", () => {
    expect(resolveLoginMaxAttempts({ NODE_ENV: "production" })).toBe(5);
    expect(resolveLoginMaxAttempts({ NODE_ENV: "development" })).toBe(5);
    expect(resolveLoginMaxAttempts({ NODE_ENV: "test" })).toBe(5);
  });

  it("allows a higher cap only in test or Playwright", () => {
    expect(
      resolveLoginMaxAttempts({
        NODE_ENV: "test",
        TEST_LOGIN_RATE_LIMIT_MAX: "60",
      }),
    ).toBe(60);
    expect(
      resolveLoginMaxAttempts({
        NODE_ENV: "development",
        PLAYWRIGHT: "1",
        TEST_LOGIN_RATE_LIMIT_MAX: "60",
      }),
    ).toBe(60);
  });

  it("fails closed when the override is used outside the permitted environment", () => {
    expect(() =>
      resolveLoginMaxAttempts({
        NODE_ENV: "production",
        TEST_LOGIN_RATE_LIMIT_MAX: "60",
      }),
    ).toThrow(RateLimitConfigError);
    expect(() =>
      resolveLoginMaxAttempts({
        NODE_ENV: "development",
        TEST_LOGIN_RATE_LIMIT_MAX: "60",
      }),
    ).toThrow(RateLimitConfigError);
  });

  it("rejects an invalid override instead of applying it", () => {
    expect(() =>
      resolveLoginMaxAttempts({
        NODE_ENV: "test",
        TEST_LOGIN_RATE_LIMIT_MAX: "abc",
      }),
    ).toThrow(RateLimitConfigError);
    expect(() =>
      resolveLoginMaxAttempts({
        NODE_ENV: "test",
        TEST_LOGIN_RATE_LIMIT_MAX: "200",
      }),
    ).toThrow(RateLimitConfigError);
  });
});

describe("resolveActionMaxAttempts", () => {
  it("defaults to 60 outside automated tests", () => {
    expect(resolveActionMaxAttempts({ NODE_ENV: "production" })).toBe(ACTION_MAX_ATTEMPTS);
    expect(resolveActionMaxAttempts({ NODE_ENV: "development" })).toBe(ACTION_MAX_ATTEMPTS);
  });

  it("allows a higher cap only in test or Playwright", () => {
    expect(
      resolveActionMaxAttempts({
        NODE_ENV: "test",
        TEST_ACTION_RATE_LIMIT_MAX: "400",
      }),
    ).toBe(400);
    expect(
      resolveActionMaxAttempts({
        NODE_ENV: "development",
        PLAYWRIGHT: "1",
        TEST_ACTION_RATE_LIMIT_MAX: "400",
      }),
    ).toBe(400);
  });

  it("fails closed when the override is used outside the permitted environment", () => {
    expect(() =>
      resolveActionMaxAttempts({
        NODE_ENV: "production",
        TEST_ACTION_RATE_LIMIT_MAX: "400",
      }),
    ).toThrow(RateLimitConfigError);
    expect(() =>
      resolveActionMaxAttempts({
        NODE_ENV: "development",
        TEST_ACTION_RATE_LIMIT_MAX: "400",
      }),
    ).toThrow(RateLimitConfigError);
  });
});
