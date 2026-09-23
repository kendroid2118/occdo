import { TrainingKind } from "@prisma/client";
import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { createComplianceRecord } from "@/lib/dal/compliance-records";
import { createCooperative } from "@/lib/dal/cooperatives";
import { getDashboardSummary } from "@/lib/dal/dashboard";
import { prisma } from "@/lib/dal/prisma";
import { ONGOING_REGISTRATION_STATUS_CODE } from "@/lib/dashboard/status-codes";
import { utcCalendarYearRange } from "@/lib/dashboard/year-range";

const prefix = "occdo-035";
const actorEmail = `${prefix}-actor@example.invalid`;
const asOf = new Date("2026-06-15T00:00:00.000Z");

describe("dashboard summary DAL", () => {
  let actorId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.serviceDelivery.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.complianceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });

    const [actor, coopType, sector, barangay, ongoingStatus, accreditedStatus, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-035 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-CT`, name: "Dashboard type", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.cooperativeSector.findFirst({
          where: { code: "AG", isActive: true },
          select: { id: true },
        }),
        prisma.barangay.findFirst({
          where: { isActive: true },
          select: { id: true },
        }),
        prisma.cooperativeStatus.findFirst({
          where: { code: ONGOING_REGISTRATION_STATUS_CODE, isActive: true },
          select: { id: true },
        }),
        prisma.cooperativeStatus.findFirst({
          where: { code: "ACCREDITED", isActive: true },
          select: { id: true },
        }),
        prisma.accreditationStatus.findFirst({
          where: { isActive: true },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay || !ongoingStatus || !accreditedStatus || !accreditation) {
      throw new Error("OCCDO-016 reference catalogs are required");
    }

    actorId = actor.id;

    const coopInput = {
      registrationNumber: null,
      acronym: null,
      typeId: coopType.id,
      sectorId: sector.id,
      address: "Ormoc",
      barangayId: barangay.id,
      contactPerson: "Staff",
      contactNumber: "09170000000",
      email: null,
      dateRegistered: null,
      dateAccredited: null,
      accreditationStatusId: accreditation.id,
      maleMembers: 0,
      femaleMembers: 0,
      remarks: null,
    };

    const [ongoingCoop, accreditedCoop] = await Promise.all([
      createCooperative({
        actorId,
        input: {
          ...coopInput,
          cooperativeCode: `${prefix}-A`,
          name: "Dashboard Coop A",
          statusId: ongoingStatus.id,
          totalMembers: 10,
        },
      }),
      createCooperative({
        actorId,
        input: {
          ...coopInput,
          cooperativeCode: `${prefix}-B`,
          name: "Dashboard Coop B",
          statusId: accreditedStatus.id,
          totalMembers: 5,
          registrationNumber: `${prefix}-B-REG`,
        },
      }),
    ]);

    const [serviceType, requirement] = await Promise.all([
      prisma.serviceType.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
      prisma.complianceRequirement.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
    ]);
    if (!serviceType || !requirement) {
      throw new Error("OCCDO-025/032 catalogs are required");
    }

    await prisma.serviceDelivery.createMany({
      data: [
        {
          cooperativeId: ongoingCoop.id,
          serviceTypeId: serviceType.id,
          deliveredAt: new Date("2026-03-01T00:00:00.000Z"),
          recordedById: actorId,
        },
        {
          cooperativeId: accreditedCoop.id,
          serviceTypeId: serviceType.id,
          deliveredAt: new Date("2025-12-31T00:00:00.000Z"),
          recordedById: actorId,
        },
      ],
    });

    await prisma.trainingEvent.createMany({
      data: [
        {
          title: `${prefix}-training`,
          kind: TrainingKind.TRAINING,
          startAt: new Date("2026-02-01T00:00:00.000Z"),
          venue: "Ormoc",
          createdById: actorId,
          updatedById: actorId,
        },
        {
          title: `${prefix}-orientation`,
          kind: TrainingKind.ORIENTATION,
          startAt: new Date("2026-04-01T00:00:00.000Z"),
          venue: "Ormoc",
          createdById: actorId,
          updatedById: actorId,
        },
        {
          title: `${prefix}-seminar`,
          kind: TrainingKind.SEMINAR,
          startAt: new Date("2026-05-01T00:00:00.000Z"),
          venue: "Ormoc",
          createdById: actorId,
          updatedById: actorId,
        },
      ],
    });

    await createComplianceRecord({
      actorId,
      input: {
        cooperativeId: ongoingCoop.id,
        requirementId: requirement.id,
        reportingPeriod: `${prefix}-2026`,
        dueDate: new Date("2026-12-31T00:00:00.000Z"),
        submittedDate: null,
        remarks: null,
      },
    });
  });

  afterAll(async () => {
    await prisma.serviceDelivery.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.complianceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("aggregates live PostgreSQL totals without PII", async () => {
    const { start, endExclusive } = utcCalendarYearRange(asOf);
    const [
      summary,
      fixtureCoops,
      fixtureDeliveriesYtd,
      fixtureTrainings,
      fixtureOrientations,
      fixtureCompliance,
    ] = await Promise.all([
      getDashboardSummary({ asOf }),
      prisma.cooperative.findMany({
        where: { cooperativeCode: { startsWith: `${prefix}-` } },
        select: {
          totalMembers: true,
          status: { select: { code: true } },
          sector: { select: { code: true } },
        },
      }),
      prisma.serviceDelivery.count({
        where: {
          cooperative: { cooperativeCode: { startsWith: `${prefix}-` } },
          deliveredAt: { gte: start, lt: endExclusive },
        },
      }),
      prisma.trainingEvent.count({
        where: { title: { startsWith: `${prefix}-` }, kind: TrainingKind.TRAINING },
      }),
      prisma.trainingEvent.count({
        where: { title: { startsWith: `${prefix}-` }, kind: TrainingKind.ORIENTATION },
      }),
      prisma.complianceRecord.count({
        where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
      }),
    ]);

    expect(fixtureCoops).toHaveLength(2);
    expect(fixtureCoops.reduce((sum, row) => sum + row.totalMembers, 0)).toBe(15);
    expect(
      fixtureCoops.filter((row) => row.status.code === ONGOING_REGISTRATION_STATUS_CODE),
    ).toHaveLength(1);
    expect(fixtureCoops.every((row) => row.sector.code === "AG")).toBe(true);
    expect(fixtureDeliveriesYtd).toBe(1);
    expect(fixtureTrainings).toBe(1);
    expect(fixtureOrientations).toBe(1);
    expect(fixtureCompliance).toBe(1);

    expect(summary.year).toBe(2026);
    expect(summary.kpis.technicalAssistance).toBe(summary.ytdDeliveries);
    expect(summary.kpis.totalCooperatives).toBeGreaterThanOrEqual(2);
    expect(summary.kpis.totalMembership).toBeGreaterThanOrEqual(15);
    expect(summary.kpis.ongoingRegistrations).toBeGreaterThanOrEqual(1);
    expect(summary.kpis.trainingsConducted).toBeGreaterThanOrEqual(1);
    expect(summary.kpis.cooperativeOrientations).toBeGreaterThanOrEqual(1);

    const fixtureType = summary.cooperativesByType.find((row) => row.code === `${prefix}-CT`);
    expect(fixtureType?.count).toBe(2);
    const agriculture = summary.cooperativesBySector.find((row) => row.code === "AG");
    expect(agriculture?.count).toBeGreaterThanOrEqual(2);
    const pending = summary.complianceByStatus.find((row) => row.code === "PENDING");
    expect(pending?.count).toBeGreaterThanOrEqual(1);

    const payload = JSON.stringify(summary);
    expect(payload).not.toContain("09170000000");
    expect(payload).not.toContain(actorEmail);
    expect(payload).not.toContain("passwordHash");
    expect(payload).not.toContain("Staff");
  });

  it("returns zero counts for unused catalog rows", async () => {
    const summary = await getDashboardSummary({ asOf });
    const emptySector = summary.cooperativesBySector.find((row) => row.count === 0);
    const unusedType = summary.cooperativesByType.find((row) => row.code !== `${prefix}-CT`);

    expect(summary.cooperativesBySector.length).toBeGreaterThan(0);
    expect(summary.cooperativesByStatus.some((row) => row.count === 0)).toBe(true);
    expect(emptySector?.count).toBe(0);
    expect(unusedType?.count ?? 0).toBeGreaterThanOrEqual(0);
  });
});
