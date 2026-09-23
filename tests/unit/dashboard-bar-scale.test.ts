import { describe, expect, it } from "vitest";

import { barShare, maxCatalogCount } from "@/lib/dashboard/bar-scale";

describe("dashboard bar scale", () => {
  it("returns zero share for empty or zero datasets", () => {
    expect(barShare(0, 0)).toBe(0);
    expect(barShare(4, 0)).toBe(0);
    expect(barShare(0, 10)).toBe(0);
    expect(maxCatalogCount([])).toBe(0);
    expect(maxCatalogCount([{ count: 0 }, { count: 0 }])).toBe(0);
  });

  it("scales counts against the observed maximum without inventing values", () => {
    expect(maxCatalogCount([{ count: 2 }, { count: 8 }, { count: 0 }])).toBe(8);
    expect(barShare(8, 8)).toBe(100);
    expect(barShare(4, 8)).toBe(50);
  });
});
