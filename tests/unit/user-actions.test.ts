import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const createManagedUser = vi.fn();
const updateManagedUser = vi.fn();
const listUsersForUi = vi.fn();
const hashPassword = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword: (...args: unknown[]) => hashPassword(...args),
}));

vi.mock("@/lib/dal/users", () => ({
  UserNotFoundError: class UserNotFoundError extends Error {
    readonly code = "NOT_FOUND" as const;
  },
  UserConflictError: class UserConflictError extends Error {
    readonly code = "CONFLICT" as const;
  },
  UserRoleAssignmentError: class UserRoleAssignmentError extends Error {
    readonly code = "FORBIDDEN" as const;
  },
  LastSuperAdminError: class LastSuperAdminError extends Error {
    readonly code = "CONFLICT" as const;
  },
  createManagedUser: (...args: unknown[]) => createManagedUser(...args),
  updateManagedUser: (...args: unknown[]) => updateManagedUser(...args),
  listUsersForUi: (...args: unknown[]) => listUsersForUi(...args),
  getUserByIdForUi: vi.fn(),
}));

import {
  createManagedUserAction,
  listManagedUsersAction,
  updateManagedUserAction,
} from "@/lib/actions/users";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-041-user",
  email: "user.041@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const adminUser: SessionUser = {
  ...staffUser,
  id: "occdo-041-admin",
  role: "ADMIN",
};

describe("user administration actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    createManagedUser.mockReset();
    updateManagedUser.mockReset();
    listUsersForUi.mockReset();
    hashPassword.mockReset();
    hashPassword.mockResolvedValue("hashed-password");
  });

  it("rejects unauthenticated user-admin reads and writes", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    await expect(listManagedUsersAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(
      createManagedUserAction({
        email: "new@example.invalid",
        password: "password1",
        role: "USER",
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(createManagedUser).not.toHaveBeenCalled();
  });

  it("forbids USER from opening user administration", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    await expect(listManagedUsersAction({})).resolves.toEqual({
      ok: false,
      code: "FORBIDDEN",
    });
    await expect(
      createManagedUserAction({
        email: "new@example.invalid",
        password: "password1",
        role: "USER",
      }),
    ).resolves.toEqual({ ok: false, code: "FORBIDDEN" });
    expect(createManagedUser).not.toHaveBeenCalled();
  });

  it("allows ADMIN to create a USER but DAL still receives the actor role", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);
    createManagedUser.mockResolvedValue({ id: "u-1", email: "new@example.invalid" });

    await expect(
      createManagedUserAction({
        email: "new@example.invalid",
        password: "password1",
        role: "USER",
      }),
    ).resolves.toEqual({ ok: true, data: { id: "u-1", email: "new@example.invalid" } });
    expect(createManagedUser).toHaveBeenCalledWith({
      actorId: adminUser.id,
      actorRole: "ADMIN",
      input: {
        email: "new@example.invalid",
        name: null,
        role: "USER",
        isActive: true,
        passwordHash: "hashed-password",
      },
    });
  });

  it("maps a last-SUPER_ADMIN lockout to CONFLICT", async () => {
    getCurrentSessionUser.mockResolvedValue({
      ...adminUser,
      role: "SUPER_ADMIN",
    });
    const { LastSuperAdminError } = await import("@/lib/dal/users");
    updateManagedUser.mockRejectedValue(new LastSuperAdminError());

    await expect(
      updateManagedUserAction({
        id: "super-1",
        role: "ADMIN",
        isActive: true,
      }),
    ).resolves.toEqual({ ok: false, code: "CONFLICT" });
  });
});
