import { describe, expect, it } from "vitest";

import { reportFiltersSchema } from "@/lib/validation/reports";

describe("reportFiltersSchema", () => {
  it("accepts empty filters with pagination defaults", () => {
    const parsed = reportFiltersSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
    expect(parsed.dateFrom).toBeUndefined();
  });

  it("rejects an invalid calendar date", () => {
    const parsed = reportFiltersSchema.safeParse({
      dateFrom: "2026-02-31",
      dateTo: "2026-03-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a start date after the end date", () => {
    const parsed = reportFiltersSchema.safeParse({
      dateFrom: "2026-09-30",
      dateTo: "2026-09-01",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a one-sided date range", () => {
    expect(reportFiltersSchema.safeParse({ dateFrom: "2026-09-01" }).success).toBe(false);
    expect(reportFiltersSchema.safeParse({ dateTo: "2026-09-30" }).success).toBe(false);
  });

  it("rejects a malformed catalog id", () => {
    expect(reportFiltersSchema.safeParse({ typeId: "" }).success).toBe(true);
    expect(reportFiltersSchema.safeParse({ typeId: "x".repeat(65) }).success).toBe(false);
  });

  it("rejects an unknown training kind", () => {
    expect(reportFiltersSchema.safeParse({ trainingKind: "WORKSHOP" }).success).toBe(false);
    expect(reportFiltersSchema.safeParse({ trainingKind: "TRAINING" }).success).toBe(true);
  });
});
