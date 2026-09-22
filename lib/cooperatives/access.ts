import type { AuthRole } from "@/lib/auth/roles";

export const COOPERATIVE_WRITE_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "DEVELOPER",
] as const;

export function canWriteCooperatives(role: AuthRole): boolean {
  return (COOPERATIVE_WRITE_ROLES as readonly AuthRole[]).includes(role);
}
