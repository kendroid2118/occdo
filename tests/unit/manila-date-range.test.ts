import { describe, expect, it } from "vitest";

import {
  isValidCalendarYmd,
  manilaCalendarDateRange,
  manilaDateTimeRange,
  parseCalendarYmd,
  toManilaCalendarDate,
} from "@/lib/reports/manila-date-range";

describe("manila date range", () => {
  it("treats inclusive Philippine calendar days as UTC+08:00 timestamps", () => {
    const range = manilaDateTimeRange("2026-09-01", "2026-09-30");

    expect(range.timeZone).toBe("Asia/Manila");
    expect(range.startInclusive.toISOString()).toBe("2026-08-31T16:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2026-09-30T16:00:00.000Z");
    expect(toManilaCalendarDate(range.startInclusive)).toBe("2026-09-01");
  });

  it("keeps date-only snapshot bounds on calendar dates", () => {
    const range = manilaCalendarDateRange("2026-09-01", "2026-09-30");

    expect(range.startInclusive.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });

  it("rejects impossible calendar dates", () => {
    expect(isValidCalendarYmd("2026-02-31")).toBe(false);
    expect(parseCalendarYmd("2026-13-01")).toBeNull();
    expect(() => manilaDateTimeRange("2026-02-31", "2026-03-01")).toThrow();
  });

  it("rejects start after end", () => {
    expect(() => manilaDateTimeRange("2026-09-30", "2026-09-01")).toThrow();
    expect(() => manilaCalendarDateRange("2026-09-30", "2026-09-01")).toThrow();
  });
});
