import { describe, expect, it } from "vitest";

import { createManagedUserSchema, updateManagedUserSchema } from "@/lib/validation/users";

describe("user administration validation", () => {
  it("normalizes email and requires a password on create", () => {
    const parsed = createManagedUserSchema.parse({
      email: "Staff@Example.Invalid",
      name: "Staff",
      password: "password1",
      role: "USER",
    });
    expect(parsed.email).toBe("staff@example.invalid");
    expect(parsed.isActive).toBe(true);
  });

  it("rejects a short password or invalid role", () => {
    expect(
      createManagedUserSchema.safeParse({
        email: "staff@example.invalid",
        password: "short",
        role: "USER",
      }).success,
    ).toBe(false);
    expect(
      createManagedUserSchema.safeParse({
        email: "staff@example.invalid",
        password: "password1",
        role: "OWNER",
      }).success,
    ).toBe(false);
  });

  it("accepts an update without a password", () => {
    const parsed = updateManagedUserSchema.parse({
      id: "user-1",
      name: "Renamed",
      role: "ADMIN",
      isActive: "false",
    });
    expect(parsed.isActive).toBe(false);
    expect(parsed.role).toBe("ADMIN");
  });
});
