import { describe, expect, it } from "vitest";

import { getSessionUser } from "@/lib/auth/session";

describe("getSessionUser", () => {
  it("returns the session user without extra fields", async () => {
    const user = await getSessionUser(async () => ({
      user: {
        id: "user-1",
        email: "staff@example.invalid",
        name: "Staff",
        role: "ADMIN",
        isActive: true,
      },
    }));

    expect(user).toEqual({
      id: "user-1",
      email: "staff@example.invalid",
      name: "Staff",
      role: "ADMIN",
      isActive: true,
    });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("returns null when unauthenticated or inactive", async () => {
    await expect(getSessionUser(async () => null)).resolves.toBeNull();
    await expect(
      getSessionUser(async () => ({
        user: {
          id: "user-1",
          email: "staff@example.invalid",
          name: "Staff",
          role: "USER",
          isActive: false,
        },
      })),
    ).resolves.toBeNull();
  });
});
