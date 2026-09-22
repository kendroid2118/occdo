import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  approveAssistanceRecordAction,
  createAssistanceRecordAction,
  createAssistanceTypeAction,
  releaseAssistanceRecordAction,
} from "@/lib/actions/assistance";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-029-user",
  email: "user.029@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("assistance write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating an assistance type", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createAssistanceTypeAction({
      code: "DEMO-FORBIDDEN",
      name: "Forbidden type",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from creating an assistance record", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createAssistanceRecordAction({
      cooperativeId: "coop-1",
      assistanceTypeId: "type-1",
      amount: "100.00",
      requestedAt: "2026-09-22",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from approving or releasing assistance", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const approve = await approveAssistanceRecordAction({
      id: "record-1",
      cooperativeId: "coop-1",
    });
    const release = await releaseAssistanceRecordAction({
      id: "record-1",
      cooperativeId: "coop-1",
    });

    expect(approve).toEqual({ ok: false, code: "FORBIDDEN" });
    expect(release).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
