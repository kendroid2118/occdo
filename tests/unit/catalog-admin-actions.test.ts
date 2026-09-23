import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const createCatalogAdminItem = vi.fn();
const listCatalogAdminItems = vi.fn();
const upsertCdaPortalUrl = vi.fn();
const getSystemConfigValue = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/catalog-admin", () => ({
  CatalogAdminNotFoundError: class CatalogAdminNotFoundError extends Error {
    readonly code = "NOT_FOUND" as const;
  },
  CatalogAdminConflictError: class CatalogAdminConflictError extends Error {
    readonly code = "CONFLICT" as const;
  },
  createCatalogAdminItem: (...args: unknown[]) => createCatalogAdminItem(...args),
  listCatalogAdminItems: (...args: unknown[]) => listCatalogAdminItems(...args),
  getCatalogAdminItem: vi.fn(),
  updateCatalogAdminItem: vi.fn(),
}));

vi.mock("@/lib/dal/system-config", () => ({
  getSystemConfigValue: (...args: unknown[]) => getSystemConfigValue(...args),
  upsertCdaPortalUrl: (...args: unknown[]) => upsertCdaPortalUrl(...args),
}));

vi.mock("@/lib/dashboard/cda-portal", () => ({
  getCdaPortalUrl: () => null,
}));

import {
  createCatalogAdminItemAction,
  listCatalogAdminItemsAction,
} from "@/lib/actions/catalog-admin";
import { upsertCdaPortalUrlAction } from "@/lib/actions/system-config";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-042-user",
  email: "user.042@example.invalid",
  name: "Staff",
  role: "USER",
  isActive: true,
};

const adminUser: SessionUser = { ...staffUser, id: "occdo-042-admin", role: "ADMIN" };
const superUser: SessionUser = {
  ...staffUser,
  id: "occdo-042-super",
  role: "SUPER_ADMIN",
};

describe("catalog and system-config actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    createCatalogAdminItem.mockReset();
    listCatalogAdminItems.mockReset();
    upsertCdaPortalUrl.mockReset();
    getSystemConfigValue.mockReset();
  });

  it("rejects unauthenticated catalog and config mutations", async () => {
    getCurrentSessionUser.mockResolvedValue(null);
    await expect(listCatalogAdminItemsAction({ kind: "sector" })).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(upsertCdaPortalUrlAction({ value: "https://cda.gov.ph" })).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
  });

  it("forbids USER and ADMIN from catalog and config mutations", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);
    await expect(
      createCatalogAdminItemAction({ kind: "sector", code: "X", name: "X" }),
    ).resolves.toEqual({ ok: false, code: "FORBIDDEN" });

    getCurrentSessionUser.mockResolvedValue(adminUser);
    await expect(
      createCatalogAdminItemAction({ kind: "sector", code: "X", name: "X" }),
    ).resolves.toEqual({ ok: false, code: "FORBIDDEN" });
    await expect(upsertCdaPortalUrlAction({ value: "https://cda.gov.ph" })).resolves.toEqual({
      ok: false,
      code: "FORBIDDEN",
    });
    expect(createCatalogAdminItem).not.toHaveBeenCalled();
  });

  it("allows SUPER_ADMIN to create a sector", async () => {
    getCurrentSessionUser.mockResolvedValue(superUser);
    createCatalogAdminItem.mockResolvedValue({ id: "sec-1", code: "X", name: "X" });

    await expect(
      createCatalogAdminItemAction({ kind: "sector", code: "X", name: "X" }),
    ).resolves.toEqual({ ok: true, data: { id: "sec-1", code: "X", name: "X" } });
  });
});
