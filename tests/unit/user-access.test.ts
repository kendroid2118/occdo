import { describe, expect, it } from "vitest";

import {
  assignableRolesFor,
  canAdministerUsers,
  canAssignRole,
  canManageUserRole,
} from "@/lib/users/access";

describe("user administration access", () => {
  it("allows ADMIN+ to administer users and USER not to", () => {
    expect(canAdministerUsers("USER")).toBe(false);
    expect(canAdministerUsers("ADMIN")).toBe(true);
    expect(canAdministerUsers("SUPER_ADMIN")).toBe(true);
    expect(canAdministerUsers("DEVELOPER")).toBe(true);
  });

  it("prevents ADMIN from assigning SUPER_ADMIN or DEVELOPER", () => {
    expect(canAssignRole("ADMIN", "USER")).toBe(true);
    expect(canAssignRole("ADMIN", "ADMIN")).toBe(true);
    expect(canAssignRole("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(canAssignRole("ADMIN", "DEVELOPER")).toBe(false);
    expect(canManageUserRole("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(assignableRolesFor("ADMIN")).toEqual(["ADMIN", "USER"]);
  });

  it("allows SUPER_ADMIN and DEVELOPER to assign privileged roles", () => {
    expect(canAssignRole("SUPER_ADMIN", "DEVELOPER")).toBe(true);
    expect(canAssignRole("DEVELOPER", "SUPER_ADMIN")).toBe(true);
    expect(assignableRolesFor("SUPER_ADMIN")).toEqual([
      "DEVELOPER",
      "SUPER_ADMIN",
      "ADMIN",
      "USER",
    ]);
  });
});
