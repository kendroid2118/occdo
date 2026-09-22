/**
 * Auth.js configuration and RBAC helpers (M1).
 */
export const AUTH_ROLES = ["DEVELOPER", "SUPER_ADMIN", "ADMIN", "USER"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];
