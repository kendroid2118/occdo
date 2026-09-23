import { describe, expect, it } from "vitest";

import { isPublishedAnnouncement } from "@/lib/announcements/published";

const asOf = new Date("2026-09-23T01:00:00.000Z");

describe("published announcement filter", () => {
  it("includes active published unexpired announcements", () => {
    expect(
      isPublishedAnnouncement(
        {
          isActive: true,
          publishedAt: new Date("2026-09-23T00:00:00.000Z"),
          expiresAt: new Date("2026-09-24T00:00:00.000Z"),
        },
        asOf,
      ),
    ).toBe(true);
    expect(
      isPublishedAnnouncement(
        {
          isActive: true,
          publishedAt: new Date("2026-09-22T00:00:00.000Z"),
          expiresAt: null,
        },
        asOf,
      ),
    ).toBe(true);
  });

  it("excludes inactive, unpublished, and expired announcements", () => {
    expect(
      isPublishedAnnouncement(
        {
          isActive: false,
          publishedAt: new Date("2026-09-22T00:00:00.000Z"),
          expiresAt: null,
        },
        asOf,
      ),
    ).toBe(false);
    expect(
      isPublishedAnnouncement(
        {
          isActive: true,
          publishedAt: new Date("2026-09-23T02:00:00.000Z"),
          expiresAt: null,
        },
        asOf,
      ),
    ).toBe(false);
    expect(
      isPublishedAnnouncement(
        {
          isActive: true,
          publishedAt: new Date("2026-09-22T00:00:00.000Z"),
          expiresAt: new Date("2026-09-23T01:00:00.000Z"),
        },
        asOf,
      ),
    ).toBe(false);
  });
});
