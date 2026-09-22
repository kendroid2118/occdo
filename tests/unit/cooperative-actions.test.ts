import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { createCooperativeAction } from "@/lib/actions/cooperatives";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-018-user",
  email: "user.018@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const writeInput = {
  cooperativeCode: "OCC-018-FORBIDDEN",
  name: "Forbidden Write",
  typeId: "type-1",
  sectorId: "sector-1",
  address: "Ormoc",
  barangayId: "brgy-1",
  contactPerson: "Staff",
  contactNumber: "09170000000",
  accreditationStatusId: "acc-1",
  statusId: "status-1",
  totalMembers: 0,
  maleMembers: 0,
  femaleMembers: 0,
};

describe("cooperative write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating a cooperative", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createCooperativeAction(writeInput);

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
