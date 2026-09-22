import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  createTrainingEventAction,
  updateTrainingEventAction,
} from "@/lib/actions/training-events";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-027-user",
  email: "user.027@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const writeInput = {
  title: "Forbidden Event",
  kind: "TRAINING",
  startAt: "2026-09-22",
  venue: "OCCDO Hall",
};

describe("training event write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating a training event", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createTrainingEventAction(writeInput);

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from updating a training event", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await updateTrainingEventAction({
      ...writeInput,
      id: "event-1",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
