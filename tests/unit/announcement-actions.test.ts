import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const createAnnouncement = vi.fn();
const listPublishedAnnouncements = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/announcements", () => ({
  createAnnouncement: (...args: unknown[]) => createAnnouncement(...args),
  listPublishedAnnouncements: (...args: unknown[]) => listPublishedAnnouncements(...args),
  isPublishedAnnouncement: vi.fn(),
  publishedAnnouncementWhere: vi.fn(),
}));

import {
  createAnnouncementAction,
  listPublishedAnnouncementsAction,
} from "@/lib/actions/announcements";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-040-user",
  email: "user.040@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const adminUser: SessionUser = {
  ...staffUser,
  id: "occdo-040-admin",
  role: "ADMIN",
};

describe("announcement actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    createAnnouncement.mockReset();
    listPublishedAnnouncements.mockReset();
  });

  it("rejects unauthenticated announcement reads and writes", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    await expect(listPublishedAnnouncementsAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(
      createAnnouncementAction({
        title: "Notice",
        body: "Hello",
        publishedAt: "2026-09-23T08:00",
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(createAnnouncement).not.toHaveBeenCalled();
  });

  it("allows USER to read published announcements but not create them", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);
    listPublishedAnnouncements.mockResolvedValue([]);

    await expect(listPublishedAnnouncementsAction({})).resolves.toEqual({
      ok: true,
      data: [],
    });
    await expect(
      createAnnouncementAction({
        title: "Notice",
        body: "Hello",
        publishedAt: "2026-09-23T08:00",
      }),
    ).resolves.toEqual({ ok: false, code: "FORBIDDEN" });
    expect(createAnnouncement).not.toHaveBeenCalled();
  });

  it("allows ADMIN to publish an announcement", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);
    createAnnouncement.mockResolvedValue({ id: "ann-1", title: "Notice" });

    await expect(
      createAnnouncementAction({
        title: "Notice",
        body: "Hello",
        publishedAt: "2026-09-23T08:00",
      }),
    ).resolves.toEqual({ ok: true, data: { id: "ann-1", title: "Notice" } });
  });
});
