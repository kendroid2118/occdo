import { describe, expect, it } from "vitest";

import { AUTH_ROLES } from "@/lib/auth/roles";

describe("AUTH_ROLES", () => {
  it("includes the four project roles", () => {
    expect(AUTH_ROLES).toEqual(["DEVELOPER", "SUPER_ADMIN", "ADMIN", "USER"]);
  });
});
