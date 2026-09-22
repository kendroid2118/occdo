import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  decideAccreditationCaseAction,
  fileAccreditationCaseAction,
} from "@/lib/actions/accreditation";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-023-user",
  email: "user.023@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("accreditation decide action", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from filing a case", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await fileAccreditationCaseAction({
      cooperativeId: "coop-1",
      typeId: "type-1",
      statusId: "status-1",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("forbids USER from deciding a case", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await decideAccreditationCaseAction({
      id: "case-1",
      cooperativeId: "coop-1",
      statusId: "status-1",
      accreditationStatusId: "acc-1",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });
});
