import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const createCalendarActivity = vi.fn();
const listUpcomingCalendarActivities = vi.fn();
const listCalendarActivities = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/calendar", () => ({
  CalendarActivityNotFoundError: class CalendarActivityNotFoundError extends Error {
    readonly code = "NOT_FOUND" as const;
  },
  CalendarActivityReferenceError: class CalendarActivityReferenceError extends Error {
    readonly code = "VALIDATION" as const;
  },
  createCalendarActivity: (...args: unknown[]) => createCalendarActivity(...args),
  listUpcomingCalendarActivities: (...args: unknown[]) =>
    listUpcomingCalendarActivities(...args),
  listCalendarActivities: (...args: unknown[]) => listCalendarActivities(...args),
  getCalendarActivityById: vi.fn(),
  listCalendarLinkOptions: vi.fn(),
  updateCalendarActivity: vi.fn(),
}));

import {
  createCalendarActivityAction,
  listUpcomingCalendarActivitiesAction,
} from "@/lib/actions/calendar";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-039-user",
  email: "user.039@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

const adminUser: SessionUser = {
  ...staffUser,
  id: "occdo-039-admin",
  role: "ADMIN",
};

describe("calendar actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    createCalendarActivity.mockReset();
    listUpcomingCalendarActivities.mockReset();
  });

  it("rejects unauthenticated calendar reads and writes", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    await expect(listUpcomingCalendarActivitiesAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(
      createCalendarActivityAction({
        title: "Meeting",
        kind: "ACTIVITY",
        startAt: "2026-09-23T09:00",
      }),
    ).resolves.toEqual({ ok: false, code: "UNAUTHORIZED" });
    expect(createCalendarActivity).not.toHaveBeenCalled();
  });

  it("allows USER to read upcoming activities but not create them", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);
    listUpcomingCalendarActivities.mockResolvedValue([]);

    await expect(listUpcomingCalendarActivitiesAction({})).resolves.toEqual({
      ok: true,
      data: [],
    });
    await expect(
      createCalendarActivityAction({
        title: "Meeting",
        kind: "ACTIVITY",
        startAt: "2026-09-23T09:00",
      }),
    ).resolves.toEqual({ ok: false, code: "FORBIDDEN" });
    expect(createCalendarActivity).not.toHaveBeenCalled();
  });

  it("allows ADMIN to create an activity", async () => {
    getCurrentSessionUser.mockResolvedValue(adminUser);
    createCalendarActivity.mockResolvedValue({ id: "act-1", title: "Meeting" });

    await expect(
      createCalendarActivityAction({
        title: "Meeting",
        kind: "ACTIVITY",
        startAt: "2026-09-23T09:00",
      }),
    ).resolves.toEqual({ ok: true, data: { id: "act-1", title: "Meeting" } });
  });
});
