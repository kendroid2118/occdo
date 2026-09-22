import { describe, expect, it } from "vitest";

import {
  SEED_COOPERATIVE_SECTORS,
  SEED_DOCUMENT_TYPES,
  SEED_ORMOC_BARANGAYS,
  SEED_PROGRAMS,
  SEED_SERVICE_TYPES,
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

  it("defines unique labeled demo program and service type seeds", () => {
    const programCodes = SEED_PROGRAMS.map((row) => row.code);
    const serviceCodes = SEED_SERVICE_TYPES.map((row) => row.code);

    expect(programCodes.length).toBeGreaterThan(0);
    expect(serviceCodes.length).toBeGreaterThan(0);
    expect(new Set(programCodes).size).toBe(programCodes.length);
    expect(new Set(serviceCodes).size).toBe(serviceCodes.length);
    expect(programCodes.every((code) => code.startsWith("DEMO-"))).toBe(true);
    expect(serviceCodes.every((code) => code.startsWith("DEMO-"))).toBe(true);
  });

  it("defines unique labeled demo document type seeds", () => {
    const codes = SEED_DOCUMENT_TYPES.map((row) => row.code);
    expect(codes.length).toBeGreaterThan(0);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((code) => code.startsWith("DEMO-"))).toBe(true);
  });
});
