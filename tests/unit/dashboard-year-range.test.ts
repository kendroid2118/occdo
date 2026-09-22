import { describe, expect, it } from "vitest";

import { utcCalendarYearRange } from "@/lib/dashboard/year-range";

describe("utcCalendarYearRange", () => {
  it("returns an exclusive UTC year window", () => {
    const range = utcCalendarYearRange(new Date("2026-06-15T12:00:00.000Z"));

    expect(range.year).toBe(2026);
    expect(range.start.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});
