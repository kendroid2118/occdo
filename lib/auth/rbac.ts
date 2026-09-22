import type { AuthRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/session";

export type AuthzCode = "UNAUTHORIZED" | "FORBIDDEN";

export class AuthzError extends Error {
  readonly code: AuthzCode;

  constructor(code: AuthzCode) {
    super(code === "UNAUTHORIZED" ? "Unauthorized" : "Forbidden");
    this.name = "AuthzError";
    this.code = code;
  }
}

export function requireRole(
  user: SessionUser | null,
  allowed: readonly AuthRole[],
): SessionUser {
  if (!user || user.isActive !== true) {
    throw new AuthzError("UNAUTHORIZED");
  }

  if (!allowed.includes(user.role)) {
    throw new AuthzError("FORBIDDEN");
  }

  return user;
}
