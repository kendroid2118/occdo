import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { createTrainingParticipantAction } from "@/lib/actions/training-participants";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-028-user",
  email: "user.028@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("training participant write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from adding a participant", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createTrainingParticipantAction({
      trainingEventId: "event-1",
      fullName: "Ana Reyes",
      attendanceStatus: "REGISTERED",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
