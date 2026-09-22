import { Role } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authorizeCredentials } from "@/lib/auth/credentials";
import { hashPassword } from "@/lib/auth/password";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

describe("authorizeCredentials", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
  });

  it("returns a session user without passwordHash on valid credentials", async () => {
    const passwordHash = await hashPassword("correct-password-value");
    const result = await authorizeCredentials(
      { email: "staff@example.invalid", password: "correct-password-value" },
      async () => ({
        id: "user-1",
        email: "staff@example.invalid",
        name: "Staff",
        role: Role.USER,
        isActive: true,
        passwordHash,
      }),
    );

    expect(result).toEqual({
      id: "user-1",
      email: "staff@example.invalid",
      name: "Staff",
      role: "USER",
      isActive: true,
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("returns null for unknown user, bad password, or inactive user", async () => {
    const passwordHash = await hashPassword("correct-password-value");

    const unknown = await authorizeCredentials(
      { email: "missing@example.invalid", password: "correct-password-value" },
      async () => null,
    );
    const badPassword = await authorizeCredentials(
      { email: "staff@example.invalid", password: "wrong-password-value" },
      async () => ({
        id: "user-1",
        email: "staff@example.invalid",
        name: "Staff",
        role: Role.USER,
        isActive: true,
        passwordHash,
      }),
    );
    const inactive = await authorizeCredentials(
      { email: "staff@example.invalid", password: "correct-password-value" },
      async () => ({
        id: "user-1",
        email: "staff@example.invalid",
        name: "Staff",
        role: Role.USER,
        isActive: false,
        passwordHash,
      }),
    );

    expect(unknown).toBeNull();
    expect(badPassword).toBeNull();
    expect(inactive).toBeNull();
  });

  it("returns null after too many attempts for the same identifier", async () => {
    const getUser = vi.fn(async () => null);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await authorizeCredentials(
        { email: "limited@example.invalid", password: "any-password-value" },
        getUser,
      );
    }

    const blocked = await authorizeCredentials(
      { email: "limited@example.invalid", password: "any-password-value" },
      getUser,
    );

    expect(blocked).toBeNull();
    expect(getUser).toHaveBeenCalledTimes(5);
  });
});
