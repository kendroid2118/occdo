import { describe, expect, it } from "vitest";

import {
  manilaDateTimeToUtc,
  parseManilaDateTimeInput,
  utcToManilaDateTimeLocal,
} from "@/lib/calendar/manila-datetime";

describe("Manila calendar date/time", () => {
  it("converts Asia/Manila local date/time to UTC", () => {
    const utc = manilaDateTimeToUtc("2026-09-23T09:00");
    expect(utc?.toISOString()).toBe("2026-09-23T01:00:00.000Z");
    expect(utcToManilaDateTimeLocal(utc!)).toBe("2026-09-23T09:00");
  });

  it("treats a date-only value as midnight Asia/Manila", () => {
    expect(parseManilaDateTimeInput("2026-09-01")?.toISOString()).toBe(
      "2026-08-31T16:00:00.000Z",
    );
  });

  it("rejects invalid local date/time", () => {
    expect(manilaDateTimeToUtc("2026-02-31T09:00")).toBeNull();
    expect(manilaDateTimeToUtc("2026-09-23T25:00")).toBeNull();
    expect(parseManilaDateTimeInput("not-a-date")).toBeNull();
  });
});
