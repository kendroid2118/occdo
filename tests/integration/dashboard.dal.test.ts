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

const prefix = "occdo-035";
const actorEmail = `${prefix}-actor@example.invalid`;
const asOf = new Date("2026-06-15T00:00:00.000Z");

describe("dashboard summary DAL", () => {
  let actorId = "";
  let before = {
    totalCooperatives: 0,
    ongoingRegistrations: 0,
    technicalAssistance: 0,
    trainingsConducted: 0,
    cooperativeOrientations: 0,
    totalMembership: 0,
    pendingCompliance: 0,
    agriculture: 0,
  };

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

    const baseline = await getDashboardSummary({ asOf });
    const agriculture = baseline.cooperativesBySector.find((row) => row.code === "AG");
    const pending = baseline.complianceByStatus.find((row) => row.code === "PENDING");
    before = {
      totalCooperatives: baseline.kpis.totalCooperatives,
      ongoingRegistrations: baseline.kpis.ongoingRegistrations,
      technicalAssistance: baseline.kpis.technicalAssistance,
      trainingsConducted: baseline.kpis.trainingsConducted,
      cooperativeOrientations: baseline.kpis.cooperativeOrientations,
      totalMembership: baseline.kpis.totalMembership,
      pendingCompliance: pending?.count ?? 0,
      agriculture: agriculture?.count ?? 0,
    };

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

  it("aggregates KPI deltas from PostgreSQL without PII", async () => {
    const summary = await getDashboardSummary({ asOf });

    expect(summary.year).toBe(2026);
    expect(summary.kpis.totalCooperatives).toBe(before.totalCooperatives + 2);
    expect(summary.kpis.ongoingRegistrations).toBe(before.ongoingRegistrations + 1);
    expect(summary.kpis.technicalAssistance).toBe(before.technicalAssistance + 1);
    expect(summary.kpis.technicalAssistance).toBe(summary.ytdDeliveries);
    expect(summary.kpis.trainingsConducted).toBe(before.trainingsConducted + 1);
    expect(summary.kpis.cooperativeOrientations).toBe(before.cooperativeOrientations + 1);
    expect(summary.kpis.totalMembership).toBe(before.totalMembership + 15);

    const agriculture = summary.cooperativesBySector.find((row) => row.code === "AG");
    expect(agriculture?.count).toBe(before.agriculture + 2);

    const pending = summary.complianceByStatus.find((row) => row.code === "PENDING");
    expect(pending?.count).toBe(before.pendingCompliance + 1);

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
