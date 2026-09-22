import { describe, expect, it } from "vitest";

import { mergeCatalogCounts } from "@/lib/dashboard/catalog-counts";

const catalog = [
  { id: "s-1", code: "MP", name: "Multi-Purpose" },
  { id: "s-2", code: "AG", name: "Agriculture" },
  { id: "s-3", code: "TR", name: "Transport" },
] as const;

describe("mergeCatalogCounts", () => {
  it("returns zeros when there are no grouped rows", () => {
    expect(mergeCatalogCounts(catalog, [])).toEqual([
      { id: "s-1", code: "MP", name: "Multi-Purpose", count: 0 },
      { id: "s-2", code: "AG", name: "Agriculture", count: 0 },
      { id: "s-3", code: "TR", name: "Transport", count: 0 },
    ]);
  });

  it("fills known catalog ids and ignores unknown group ids", () => {
    const merged = mergeCatalogCounts(catalog, [
      { id: "s-2", count: 4 },
      { id: "missing", count: 9 },
    ]);

    expect(merged).toEqual([
      { id: "s-1", code: "MP", name: "Multi-Purpose", count: 0 },
      { id: "s-2", code: "AG", name: "Agriculture", count: 4 },
      { id: "s-3", code: "TR", name: "Transport", count: 0 },
    ]);
  });
});
