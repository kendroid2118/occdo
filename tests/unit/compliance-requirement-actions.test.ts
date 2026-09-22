import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { createComplianceRequirementAction } from "@/lib/actions/compliance-requirements";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-031-user",
  email: "user.031@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("compliance requirement write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating a compliance requirement", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createComplianceRequirementAction({
      code: "DEMO-FORBIDDEN",
      name: "Forbidden requirement",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
