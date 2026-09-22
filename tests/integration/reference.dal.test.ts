import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SEED_COOPERATIVE_SECTORS,
  SEED_ORMOC_BARANGAYS,
  SEED_PROGRAMS,
  SEED_SERVICE_TYPES,
} from "../../db/reference-data";
import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { prisma } from "@/lib/dal/prisma";
import {
  listActiveBarangays,
  listActiveCooperativeSectors,
  listActivePrograms,
  listActiveServiceTypes,
} from "@/lib/dal/reference";

const inactiveSectorCode = "ZZ-OCCDO-016-INACTIVE";
const inactiveProgramCode = "ZZ-OCCDO-025-INACTIVE-PROG";
const inactiveServiceCode = "ZZ-OCCDO-025-INACTIVE-SVC";

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
    await prisma.program.deleteMany({
      where: { code: inactiveProgramCode },
    });
    await prisma.serviceType.deleteMany({
      where: { code: inactiveServiceCode },
    });
    await prisma.program.create({
      data: {
        code: inactiveProgramCode,
        name: "OCCDO-025 inactive program",
        sortOrder: 999,
        isActive: false,
      },
    });
    await prisma.serviceType.create({
      data: {
        code: inactiveServiceCode,
        name: "OCCDO-025 inactive service type",
        sortOrder: 999,
        isActive: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.cooperativeSector.deleteMany({
      where: { code: inactiveSectorCode },
    });
    await prisma.program.deleteMany({
      where: { code: inactiveProgramCode },
    });
    await prisma.serviceType.deleteMany({
      where: { code: inactiveServiceCode },
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

  it("lists seeded demo programs and service types and excludes inactive rows", async () => {
    const [programs, serviceTypes] = await Promise.all([
      listActivePrograms(),
      listActiveServiceTypes(),
    ]);
    const programCodes = programs.map((row) => row.code);
    const serviceCodes = serviceTypes.map((row) => row.code);

    expect(SEED_PROGRAMS.every((row) => programCodes.includes(row.code))).toBe(true);
    expect(SEED_SERVICE_TYPES.every((row) => serviceCodes.includes(row.code))).toBe(
      true,
    );
    expect(programCodes).not.toContain(inactiveProgramCode);
    expect(serviceCodes).not.toContain(inactiveServiceCode);
    expect(programs.every((row) => row.isActive)).toBe(true);
    expect(serviceTypes.every((row) => row.isActive)).toBe(true);
  });
});
