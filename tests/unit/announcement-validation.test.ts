import { describe, expect, it } from "vitest";

import { createAnnouncementSchema } from "@/lib/validation/announcements";

describe("announcement validation", () => {
  it("accepts Manila local published/expiry date/time", () => {
    const parsed = createAnnouncementSchema.parse({
      title: "Office closed",
      body: "OCCDO is closed on Friday.",
      publishedAt: "2026-09-23T08:00",
      expiresAt: "2026-09-24T17:00",
      isActive: true,
    });
    expect(parsed.publishedAt.toISOString()).toBe("2026-09-23T00:00:00.000Z");
    expect(parsed.expiresAt?.toISOString()).toBe("2026-09-24T09:00:00.000Z");
    expect(parsed.isActive).toBe(true);
  });

  it("defaults missing publishedAt to now and isActive to true", () => {
    const before = Date.now();
    const parsed = createAnnouncementSchema.parse({
      title: "Notice",
      body: "Plain text only.",
    });
    const after = Date.now();
    expect(parsed.isActive).toBe(true);
    expect(parsed.publishedAt.getTime()).toBeGreaterThanOrEqual(before);
    expect(parsed.publishedAt.getTime()).toBeLessThanOrEqual(after);
  });

  it("rejects inverted expiry before published and invalid dates", () => {
    expect(
      createAnnouncementSchema.safeParse({
        title: "Backwards",
        body: "No",
        publishedAt: "2026-09-23T10:00",
        expiresAt: "2026-09-23T09:00",
      }).success,
    ).toBe(false);
    expect(
      createAnnouncementSchema.safeParse({
        title: "Bad",
        body: "No",
        publishedAt: "2026-02-31T08:00",
      }).success,
    ).toBe(false);
    expect(
      createAnnouncementSchema.safeParse({
        title: "",
        body: "Missing title",
      }).success,
    ).toBe(false);
  });
});
