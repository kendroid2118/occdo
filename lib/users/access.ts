import { AUTH_ROLES, type AuthRole } from "@/lib/auth/roles";

export const USER_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "DEVELOPER"] as const;

export const PRIVILEGED_ROLES = ["SUPER_ADMIN", "DEVELOPER"] as const;

export const USER_ROLE_LABEL = {
  DEVELOPER: "Developer",
  SUPER_ADMIN: "Super admin",
  ADMIN: "Admin",
  USER: "User",
} as const;

export function isPrivilegedRole(role: AuthRole): boolean {
  return (PRIVILEGED_ROLES as readonly AuthRole[]).includes(role);
}

export function canAdministerUsers(role: AuthRole): boolean {
  return (USER_ADMIN_ROLES as readonly AuthRole[]).includes(role);
}

export function canAssignRole(actorRole: AuthRole, targetRole: AuthRole): boolean {
  if (!canAdministerUsers(actorRole)) {
    return false;
  }
  if (isPrivilegedRole(targetRole)) {
    return isPrivilegedRole(actorRole);
  }
  return true;
}

export function canManageUserRole(actorRole: AuthRole, currentRole: AuthRole): boolean {
  if (!canAdministerUsers(actorRole)) {
    return false;
  }
  if (isPrivilegedRole(currentRole)) {
    return isPrivilegedRole(actorRole);
  }
  return true;
}

export function assignableRolesFor(actorRole: AuthRole): AuthRole[] {
  return AUTH_ROLES.filter((role) => canAssignRole(actorRole, role));
}
