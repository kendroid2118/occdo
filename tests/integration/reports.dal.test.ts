import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { createCooperative } from "@/lib/dal/cooperatives";
import { MEMBERSHIP_SNAPSHOT_SOURCE } from "@/lib/dal/membership";
import { prisma } from "@/lib/dal/prisma";
import {
  ReportFilterError,
  getCooperativeReport,
  getMembershipReport,
} from "@/lib/dal/reports";
import { reportFiltersSchema } from "@/lib/validation/reports";

const prefix = "occdo-037";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("reports DAL", () => {
  let actorId = "";
  let typeId = "";
  let otherTypeId = "";
  let sectorId = "";
  let barangayId = "";
  let statusId = "";
  let accreditationId = "";
  let includedCoopId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.membershipSnapshot.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({
      where: { code: { in: [`${prefix}-CT`, `${prefix}-CT2`] } },
    });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });

    const [actor, coopType, otherType, sector, barangay, coopStatus, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-037 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-CT`, name: "Report type", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-CT2`, name: "Unused report type", sortOrder: 2 },
          select: { id: true },
        }),
        prisma.cooperativeSector.findFirst({
          where: { isActive: true },
          select: { id: true },
        }),
        prisma.barangay.findFirst({
          where: { isActive: true },
          select: { id: true },
        }),
        prisma.cooperativeStatus.create({
          data: { code: `${prefix}-CS`, name: "Report status", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationStatus.create({
          data: { code: `${prefix}-ACC`, name: "Report accreditation", sortOrder: 1 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    typeId = coopType.id;
    otherTypeId = otherType.id;
    sectorId = sector.id;
    barangayId = barangay.id;
    statusId = coopStatus.id;
    accreditationId = accreditation.id;

    const baseInput = {
      registrationNumber: null,
      acronym: null,
      typeId,
      sectorId,
      address: "Ormoc",
      barangayId,
      contactPerson: "Staff",
      contactNumber: "09170000000",
      email: null,
      dateAccredited: null,
      accreditationStatusId: accreditationId,
      statusId,
      remarks: null,
    };

    const [included, excluded] = await Promise.all([
      createCooperative({
        actorId,
        input: {
          ...baseInput,
          cooperativeCode: `${prefix}-IN`,
          name: "Report Included Coop",
          dateRegistered: new Date("2026-08-31T16:00:00.000Z"),
          totalMembers: 10,
          maleMembers: 4,
          femaleMembers: 3,
        },
      }),
      createCooperative({
        actorId,
        input: {
          ...baseInput,
          cooperativeCode: `${prefix}-OUT`,
          name: "Report Excluded Coop",
          dateRegistered: new Date("2026-09-30T16:00:00.000Z"),
          totalMembers: 99,
          maleMembers: 40,
          femaleMembers: 50,
        },
      }),
    ]);
    includedCoopId = included.id;

    await prisma.membershipSnapshot.createMany({
      data: [
        {
          cooperativeId: included.id,
          asOfDate: new Date("2026-09-01T00:00:00.000Z"),
          totalMembers: 7,
          maleMembers: 2,
          femaleMembers: 2,
          source: MEMBERSHIP_SNAPSHOT_SOURCE,
          recordedById: actorId,
        },
        {
          cooperativeId: included.id,
          asOfDate: new Date("2026-10-01T00:00:00.000Z"),
          totalMembers: 10,
          maleMembers: 4,
          femaleMembers: 3,
          source: MEMBERSHIP_SNAPSHOT_SOURCE,
          recordedById: actorId,
        },
        {
          cooperativeId: excluded.id,
          asOfDate: new Date("2026-09-15T00:00:00.000Z"),
          totalMembers: 80,
          maleMembers: 30,
          femaleMembers: 40,
          source: MEMBERSHIP_SNAPSHOT_SOURCE,
          recordedById: actorId,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.membershipSnapshot.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperativeType.deleteMany({
      where: { code: { in: [`${prefix}-CT`, `${prefix}-CT2`] } },
    });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("filters cooperative registrations by Asia/Manila day boundaries", async () => {
    const input = reportFiltersSchema.parse({
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
      typeId,
    });
    const report = await getCooperativeReport(input);
    const codes = report.items.map((row) => row.cooperativeCode);

    expect(codes).toEqual([`${prefix}-IN`]);
    expect(report.total).toBe(1);
    expect(report.items[0]?.dateRegistered).toBe("2026-09-01");
    expect(JSON.stringify(report)).not.toContain("09170000000");
    expect(JSON.stringify(report)).not.toContain("passwordHash");
  });

  it("uses current cooperative membership and snapshot history separately", async () => {
    const input = reportFiltersSchema.parse({
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
      typeId,
    });
    const report = await getMembershipReport(input);
    const included = report.current.items.find((row) => row.cooperativeCode === `${prefix}-IN`);
    const excluded = report.current.items.find((row) => row.cooperativeCode === `${prefix}-OUT`);

    expect(included).toEqual({
      cooperativeId: includedCoopId,
      cooperativeCode: `${prefix}-IN`,
      name: "Report Included Coop",
      totalMembers: 10,
      maleMembers: 4,
      femaleMembers: 3,
    });
    expect(included && included.maleMembers + included.femaleMembers).not.toBe(
      included?.totalMembers,
    );
    expect(excluded?.totalMembers).toBe(99);
    expect(report.current.totals).toEqual({
      cooperatives: 2,
      totalMembers: 109,
      maleMembers: 44,
      femaleMembers: 53,
    });
    expect(report.historical.items).toHaveLength(2);
    expect(
      report.historical.items.map((row) => `${row.cooperativeCode}:${row.asOfDate}:${row.totalMembers}`),
    ).toEqual([`${prefix}-OUT:2026-09-15:80`, `${prefix}-IN:2026-09-01:7`]);
    expect(report.historical.items.every((row) => row.totalMembers !== 99)).toBe(true);
    expect(JSON.stringify(report)).not.toContain("09170000000");
  });

  it("returns an empty cooperative report for a zero-result filter", async () => {
    const report = await getCooperativeReport(
      reportFiltersSchema.parse({ typeId: otherTypeId }),
    );
    expect(report.items).toEqual([]);
    expect(report.total).toBe(0);
  });

  it("rejects an unknown catalog filter", async () => {
    await expect(
      getCooperativeReport(
        reportFiltersSchema.parse({ typeId: "missing-catalog-id" }),
      ),
    ).rejects.toBeInstanceOf(ReportFilterError);
  });
});
