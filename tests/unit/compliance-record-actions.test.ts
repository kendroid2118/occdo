import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  createComplianceRecordAction,
  verifyComplianceRecordAction,
} from "@/lib/actions/compliance-records";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-032-user",
  email: "user.032@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("compliance record write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating a compliance record", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createComplianceRecordAction({
      cooperativeId: "coop-1",
      requirementId: "req-1",
      reportingPeriod: "2026",
      dueDate: "2026-12-31",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from verifying a compliance record", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await verifyComplianceRecordAction({
      id: "record-1",
      cooperativeId: "coop-1",
      verifiedById: "spoof-user",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
