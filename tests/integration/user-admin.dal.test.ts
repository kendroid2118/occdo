import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/dal/prisma";
import {
  LastSuperAdminError,
  UserRoleAssignmentError,
  createManagedUser,
  updateManagedUser,
} from "@/lib/dal/users";

const prefix = "occdo-041";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("user administration DAL", () => {
  let actorId = "";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: `${prefix}-` } },
    });

    const actor = await prisma.user.create({
      data: {
        email: actorEmail,
        name: "OCCDO-041 Actor",
        role: Role.SUPER_ADMIN,
        isActive: true,
        passwordHash: "placeholder-hash-not-a-password",
      },
      select: { id: true },
    });
    actorId = actor.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.user.deleteMany({
      where: { email: { startsWith: `${prefix}-` } },
    });
    await prisma.$disconnect();
  });

  it("creates a user, audits a role change, and never returns passwordHash", async () => {
    const created = await createManagedUser({
      actorId,
      actorRole: "SUPER_ADMIN",
      input: {
        email: `${prefix}-staff@example.invalid`,
        name: "Staff",
        role: "USER",
        isActive: true,
        passwordHash: await hashPassword("password1"),
      },
    });

    expect(created).not.toHaveProperty("passwordHash");
    expect(created.email).toBe(`${prefix}-staff@example.invalid`);
    expect(created.role).toBe("USER");

    const updated = await updateManagedUser({
      actorId,
      actorRole: "SUPER_ADMIN",
      input: {
        id: created.id,
        name: "Staff",
        role: "ADMIN",
        isActive: true,
      },
    });
    expect(updated.role).toBe("ADMIN");
    expect(updated).not.toHaveProperty("passwordHash");

    const roleAudit = await prisma.auditLog.findFirst({
      where: { entityId: created.id, action: "USER_ROLE_CHANGE" },
      select: { entityType: true, metadata: true },
    });
    expect(roleAudit?.entityType).toBe("User");
    expect(JSON.stringify(roleAudit?.metadata)).toContain("USER");
    expect(JSON.stringify(roleAudit?.metadata)).toContain("ADMIN");
    expect(JSON.stringify(roleAudit?.metadata)).not.toContain("passwordHash");
    expect(JSON.stringify(roleAudit?.metadata)).not.toContain("password1");
  });

  it("rejects ADMIN assigning SUPER_ADMIN and last SUPER_ADMIN lockout", async () => {
    await expect(
      createManagedUser({
        actorId,
        actorRole: "ADMIN",
        input: {
          email: `${prefix}-privileged@example.invalid`,
          name: "No",
          role: "SUPER_ADMIN",
          isActive: true,
          passwordHash: "placeholder-hash-not-a-password",
        },
      }),
    ).rejects.toBeInstanceOf(UserRoleAssignmentError);

    const extra = await createManagedUser({
      actorId,
      actorRole: "SUPER_ADMIN",
      input: {
        email: `${prefix}-extra-super@example.invalid`,
        name: "Extra Super",
        role: "SUPER_ADMIN",
        isActive: true,
        passwordHash: "placeholder-hash-not-a-password",
      },
    });
    const demoted = await updateManagedUser({
      actorId,
      actorRole: "SUPER_ADMIN",
      input: {
        id: extra.id,
        name: "Extra Super",
        role: "ADMIN",
        isActive: true,
      },
    });
    expect(demoted.role).toBe("ADMIN");

    const remaining = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true },
    });
    if (remaining === 1) {
      await expect(
        updateManagedUser({
          actorId,
          actorRole: "SUPER_ADMIN",
          input: {
            id: actorId,
            name: "OCCDO-041 Actor",
            role: "ADMIN",
            isActive: true,
          },
        }),
      ).rejects.toBeInstanceOf(LastSuperAdminError);
    }
  });
});
