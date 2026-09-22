import { describe, expect, it } from "vitest";

import {
  SEED_COOPERATIVE_SECTORS,
  SEED_ORMOC_BARANGAYS,
} from "../../db/reference-data";

describe("OCCDO-016 reference seed rows", () => {
  it("defines five unique sectors", () => {
    const codes = SEED_COOPERATIVE_SECTORS.map((row) => row.code);
    expect(codes).toHaveLength(5);
    expect(new Set(codes).size).toBe(5);
  });

  it("defines 85 unique Ormoc barangays", () => {
    const codes = SEED_ORMOC_BARANGAYS.map((row) => row.code);
    expect(codes).toHaveLength(85);
    expect(new Set(codes).size).toBe(85);
  });
});
