import "server-only";

import { Prisma, type Role } from "@prisma/client";

import type { AuthRole } from "@/lib/auth/roles";
import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import { userUiSelect, type UserForUi } from "@/lib/dal/user-select";
import { canAssignRole, canManageUserRole } from "@/lib/users/access";
import type { UpdateManagedUserInput } from "@/lib/validation/users";

export type { UserForUi };

export type AuthCredentialUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  passwordHash: string | null;
};

export async function listUsersForUi(): Promise<UserForUi[]> {
  return prisma.user.findMany({
    select: userUiSelect,
    orderBy: { email: "asc" },
  });
}

export async function getUserByIdForUi(id: string): Promise<UserForUi | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userUiSelect,
  });
}

/** Auth.js credentials only. Callers must not return this record to the client. */
export async function getUserAuthByEmail(
  email: string,
): Promise<AuthCredentialUser | null> {
  return prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });
}

export class UserNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

export class UserConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("User conflict");
    this.name = "UserConflictError";
  }
}

export class UserRoleAssignmentError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Cannot assign or manage that role");
    this.name = "UserRoleAssignmentError";
  }
}

export class LastSuperAdminError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Cannot disable or demote the last SUPER_ADMIN");
    this.name = "LastSuperAdminError";
  }
}

type ManagedUserWrite = {
  name: string | null;
  role: AuthRole;
  isActive: boolean;
};

function userAdminSnapshot(row: Pick<UserForUi, "email" | "name" | "role" | "isActive">) {
  return {
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.isActive,
  };
}

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function assertRoleAssignment(actorRole: AuthRole, currentRole: AuthRole, nextRole: AuthRole) {
  if (!canManageUserRole(actorRole, currentRole) || !canAssignRole(actorRole, nextRole)) {
    throw new UserRoleAssignmentError();
  }
}

async function assertNotLastSuperAdmin(
  tx: Prisma.TransactionClient,
  existing: { role: Role; isActive: boolean },
  next: { role: AuthRole; isActive: boolean },
) {
  const losesSuperAdmin =
    existing.role === "SUPER_ADMIN" &&
    existing.isActive &&
    (next.role !== "SUPER_ADMIN" || !next.isActive);
  if (!losesSuperAdmin) {
    return;
  }

  const remaining = await tx.user.count({
    where: { role: "SUPER_ADMIN", isActive: true },
  });
  if (remaining <= 1) {
    throw new LastSuperAdminError();
  }
}

export async function createManagedUser(options: {
  actorId: string;
  actorRole: AuthRole;
  input: ManagedUserWrite & { email: string; passwordHash: string };
}): Promise<UserForUi> {
  assertRoleAssignment(options.actorRole, "USER", options.input.role);

  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: options.input.email,
          name: options.input.name,
          role: options.input.role,
          isActive: options.input.isActive,
          passwordHash: options.input.passwordHash,
        },
        select: userUiSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "USER_CREATE",
          entityType: "User",
          entityId: created.id,
          source: "WEB",
          metadata: { after: userAdminSnapshot(created) },
        },
        tx,
      );

      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new UserConflictError();
    }
    throw error;
  }
}

export async function updateManagedUser(options: {
  actorId: string;
  actorRole: AuthRole;
  input: UpdateManagedUserInput;
}): Promise<UserForUi> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id: options.input.id },
        select: userUiSelect,
      });
      if (!existing) {
        throw new UserNotFoundError();
      }

      assertRoleAssignment(options.actorRole, existing.role, options.input.role);
      await assertNotLastSuperAdmin(tx, existing, options.input);

      const updated = await tx.user.update({
        where: { id: existing.id },
        data: {
          name: options.input.name,
          role: options.input.role,
          isActive: options.input.isActive,
        },
        select: userUiSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "USER_UPDATE",
          entityType: "User",
          entityId: updated.id,
          source: "WEB",
          metadata: { before: userAdminSnapshot(existing), after: userAdminSnapshot(updated) },
        },
        tx,
      );

      if (existing.role !== updated.role) {
        await writeAuditLog(
          {
            actorId: options.actorId,
            action: "USER_ROLE_CHANGE",
            entityType: "User",
            entityId: updated.id,
            source: "WEB",
            metadata: { before: { role: existing.role }, after: { role: updated.role } },
          },
          tx,
        );
      }

      return updated;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new UserConflictError();
    }
    throw error;
  }
}
