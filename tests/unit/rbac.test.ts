import { describe, expect, it } from "vitest";

import { AuthzError, requireRole } from "@/lib/auth/rbac";
import { AUTH_ROLES, type AuthRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/session";

function user(role: AuthRole, isActive = true): SessionUser {
  return {
    id: "user-1",
    email: "staff@example.invalid",
    name: "Staff",
    role,
    isActive,
  };
}

describe("requireRole", () => {
  it.each(AUTH_ROLES)("allows %s when that role is listed", (role) => {
    expect(requireRole(user(role), [role])).toMatchObject({ role, isActive: true });
  });

  it("rejects a missing session as UNAUTHORIZED", () => {
    expect(() => requireRole(null, ["USER"])).toThrow(AuthzError);
    try {
      requireRole(null, ["USER"]);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AuthzError);
      expect((error as AuthzError).code).toBe("UNAUTHORIZED");
    }
  });

  it("rejects an inactive user as UNAUTHORIZED", () => {
    try {
      requireRole(user("ADMIN", false), ["ADMIN"]);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AuthzError);
      expect((error as AuthzError).code).toBe("UNAUTHORIZED");
    }
  });

  it("rejects a signed-in user without an allowed role as FORBIDDEN", () => {
    try {
      requireRole(user("USER"), ["ADMIN", "SUPER_ADMIN"]);
      throw new Error("expected FORBIDDEN");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(AuthzError);
      expect((error as AuthzError).code).toBe("FORBIDDEN");
    }
  });
});
