import { describe, expect, it } from "vitest";

import { userUiSelect, type UserForUi } from "@/lib/dal/user-select";

describe("userUiSelect", () => {
  it("does not include passwordHash", () => {
    expect(Object.keys(userUiSelect)).not.toContain("passwordHash");
    expect("passwordHash" in userUiSelect).toBe(false);
  });

  it("UserForUi cannot be assigned a passwordHash field", () => {
    const user: UserForUi = {
      id: "id",
      name: "Test",
      email: "test@example.invalid",
      emailVerified: null,
      role: "USER",
      isActive: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };

    expect(user).not.toHaveProperty("passwordHash");
  });
});
