import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { createServiceDeliveryAction } from "@/lib/actions/service-deliveries";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-026-user",
  email: "user.026@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("service delivery write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from recording a delivery", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createServiceDeliveryAction({
      cooperativeId: "coop-1",
      serviceTypeId: "svc-1",
      deliveredAt: "2026-01-15",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
