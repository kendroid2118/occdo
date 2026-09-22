import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const getDashboardSummary = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/dashboard", () => ({
  getDashboardSummary: (...args: unknown[]) => getDashboardSummary(...args),
}));

import { getDashboardSummaryAction } from "@/lib/actions/dashboard";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-035-user",
  email: "user.035@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const emptySummary = {
  year: 2026,
  kpis: {
    totalCooperatives: 0,
    ongoingRegistrations: 0,
    technicalAssistance: 0,
    trainingsConducted: 0,
    cooperativeOrientations: 0,
    totalMembership: 0,
  },
  cooperativesByType: [],
  cooperativesBySector: [],
  cooperativesByStatus: [],
  ytdDeliveries: 0,
  complianceByStatus: [],
};

describe("dashboard summary action", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    getDashboardSummary.mockReset();
  });

  it("rejects unauthenticated dashboard summary reads", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    const result = await getDashboardSummaryAction({});

    expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(getDashboardSummary).not.toHaveBeenCalled();
  });

  it("allows USER to request the dashboard summary", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);
    getDashboardSummary.mockResolvedValue(emptySummary);

    const result = await getDashboardSummaryAction({});

    expect(result).toEqual({ ok: true, data: emptySummary });
  });
});
