import { describe, expect, it } from "vitest";

import { createCalendarActivitySchema, listCalendarActivitiesSchema } from "@/lib/validation/calendar";

describe("calendar activity validation", () => {
  it("accepts Manila local date/time and converts start/end", () => {
    const parsed = createCalendarActivitySchema.parse({
      title: "Staff meeting",
      kind: "ACTIVITY",
      startAt: "2026-09-23T09:00",
      endAt: "2026-09-23T10:30",
    });
    expect(parsed.startAt.toISOString()).toBe("2026-09-23T01:00:00.000Z");
    expect(parsed.endAt?.toISOString()).toBe("2026-09-23T02:30:00.000Z");
  });

  it("rejects inverted end before start", () => {
    const parsed = createCalendarActivitySchema.safeParse({
      title: "Backwards",
      kind: "DEADLINE",
      startAt: "2026-09-23T10:00",
      endAt: "2026-09-23T09:00",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid kind or date", () => {
    expect(
      createCalendarActivitySchema.safeParse({
        title: "X",
        kind: "HOLIDAY",
        startAt: "2026-09-23T09:00",
      }).success,
    ).toBe(false);
    expect(
      createCalendarActivitySchema.safeParse({
        title: "X",
        kind: "ACTIVITY",
        startAt: "2026-02-31T09:00",
      }).success,
    ).toBe(false);
  });

  it("accepts a month list query", () => {
    expect(listCalendarActivitiesSchema.parse({ year: "2026", month: "9" })).toEqual({
      year: 2026,
      month: 9,
    });
  });
});
