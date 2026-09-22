import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { createFundLedgerEntryAction } from "@/lib/actions/fund-ledger";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-030-user",
  email: "user.030@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("fund ledger write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from adding a ledger entry", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createFundLedgerEntryAction({
      assistanceRecordId: "assist-1",
      cooperativeId: "coop-1",
      entryDate: "2026-09-22",
      amount: "10.00",
      entryKind: "ADJUSTMENT",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
