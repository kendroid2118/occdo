import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SEED_COOPERATIVE_SECTORS,
  SEED_ORMOC_BARANGAYS,
} from "../../db/reference-data";
import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { prisma } from "@/lib/dal/prisma";
import {
  listActiveBarangays,
  listActiveCooperativeSectors,
} from "@/lib/dal/reference";

const inactiveSectorCode = "ZZ-OCCDO-016-INACTIVE";

describe("reference DAL list-active helpers", () => {
  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.cooperativeSector.deleteMany({
      where: { code: inactiveSectorCode },
    });
    await prisma.cooperativeSector.create({
      data: {
        code: inactiveSectorCode,
        name: "OCCDO-016 inactive fixture",
        sortOrder: 999,
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.cooperativeSector.deleteMany({
      where: { code: inactiveSectorCode },
    });
    await prisma.$disconnect();
  });

  it("lists the five seeded sectors and excludes inactive rows", async () => {
    const sectors = await listActiveCooperativeSectors();
    const codes = sectors.map((row) => row.code);

    expect(SEED_COOPERATIVE_SECTORS.every((row) => codes.includes(row.code))).toBe(
      true,
    );
    expect(codes).not.toContain(inactiveSectorCode);
    expect(sectors.every((row) => row.isActive)).toBe(true);
  });

  it("lists the 85 seeded Ormoc barangays", async () => {
    const barangays = await listActiveBarangays();
    const codes = new Set(barangays.map((row) => row.code));

    expect(
      SEED_ORMOC_BARANGAYS.every((row) => codes.has(row.code)),
    ).toBe(true);
    expect(barangays.filter((row) => row.isActive)).toHaveLength(barangays.length);
  });
});
