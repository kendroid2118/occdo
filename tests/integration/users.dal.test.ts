import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/dal/prisma";
import { getUserByIdForUi, listUsersForUi } from "@/lib/dal/users";

const testEmail = "occdo-010-dal@example.invalid";

describe("users DAL UI helpers", () => {
  let userId = "";

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    const created = await prisma.user.create({
      data: {
        email: testEmail,
        name: "OCCDO-010 DAL Test",
        role: Role.USER,
        isActive: true,
        passwordHash: "placeholder-hash-not-a-password",
      },
      select: { id: true },
    });
    userId = created.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  it("getUserByIdForUi omits passwordHash", async () => {
    const user = await getUserByIdForUi(userId);
    expect(user).not.toBeNull();
    expect(user).not.toHaveProperty("passwordHash");
    expect(user?.email).toBe(testEmail);
  });

  it("listUsersForUi omits passwordHash", async () => {
    const users = await listUsersForUi();
    const match = users.find((user) => user.id === userId);
    expect(match).toBeDefined();
    expect(match).not.toHaveProperty("passwordHash");
  });
});
