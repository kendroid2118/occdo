import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import { verifyDocumentAction } from "@/lib/actions/documents";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-034-user",
  email: "user.034@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("document verify actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
  });

  it("forbids USER from verifying a document", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await verifyDocumentAction({
      id: "doc-1",
      cooperativeId: "coop-1",
      verifiedById: "spoof-user",
    });

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("rejects unauthenticated verification", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    const result = await verifyDocumentAction({
      id: "doc-1",
      cooperativeId: "coop-1",
    });

    expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
  });
});
