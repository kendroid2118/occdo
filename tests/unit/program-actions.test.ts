import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  createProgramAction,
  createServiceTypeAction,
} from "@/lib/actions/programs";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-025-user",
  email: "user.025@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const writeInput = {
  code: "DEMO-FORBIDDEN",
  name: "Forbidden catalog write",
};

describe("program catalog write actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from creating a program", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createProgramAction(writeInput);

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from creating a service type", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await createServiceTypeAction(writeInput);

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
