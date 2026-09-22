import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createCooperative } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { createServiceDelivery, listServiceDeliveries } from "@/lib/dal/service-deliveries";

const prefix = "occdo-026";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("service delivery DAL filters", () => {
  let actorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let serviceTypeAId = "";
  let serviceTypeBId = "";
  let programId = "";

  beforeAll(async () => {
    await prisma.serviceDelivery.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.program.deleteMany({ where: { code: `${prefix}-PROG` } });
    await prisma.serviceType.deleteMany({
      where: { code: { in: [`${prefix}-SVC-A`, `${prefix}-SVC-B`] } },
    });

    const [actor, coopType, sector, barangay, coopStatus, accreditation, program, serviceA, serviceB] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-026 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-CT`, name: "Type", sortOrder: 1 },
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
          data: { code: `${prefix}-CS`, name: "Status", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationStatus.create({
          data: { code: `${prefix}-ACC`, name: "Accreditation", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.program.create({
          data: { code: `${prefix}-PROG`, name: "Demo Program Fixture", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.serviceType.create({
          data: { code: `${prefix}-SVC-A`, name: "Service A", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.serviceType.create({
          data: { code: `${prefix}-SVC-B`, name: "Service B", sortOrder: 2 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    serviceTypeAId = serviceA.id;
    serviceTypeBId = serviceB.id;
    programId = program.id;

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
      statusId: coopStatus.id,
      totalMembers: 0,
      maleMembers: 0,
      femaleMembers: 0,
      remarks: null,
    };

    const [coopA, coopB] = await Promise.all([
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Delivery Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Delivery Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    await createServiceDelivery({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        serviceTypeId: serviceTypeAId,
        programId,
        deliveredAt: new Date("2026-01-15T00:00:00.000Z"),
        remarks: "January training",
      },
    });
    await createServiceDelivery({
      actorId,
      input: {
        cooperativeId: cooperativeBId,
        serviceTypeId: serviceTypeBId,
        programId: null,
        deliveredAt: new Date("2026-03-20T00:00:00.000Z"),
        remarks: "March visit",
      },
    });
  });

  afterAll(async () => {
    await prisma.serviceDelivery.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.program.deleteMany({ where: { code: `${prefix}-PROG` } });
    await prisma.serviceType.deleteMany({
      where: { code: { in: [`${prefix}-SVC-A`, `${prefix}-SVC-B`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("filters by cooperative at the database", async () => {
    const result = await listServiceDeliveries({
      page: 1,
      pageSize: 20,
      cooperativeId: cooperativeAId,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.cooperativeId).toBe(cooperativeAId);
    expect(result.items[0]?.serviceTypeId).toBe(serviceTypeAId);
    expect(result.items[0]?.programId).toBe(programId);
    expect(result.items[0]).not.toHaveProperty("passwordHash");
  });

  it("filters by service type and date range at the database", async () => {
    const inRange = await listServiceDeliveries({
      page: 1,
      pageSize: 20,
      serviceTypeId: serviceTypeAId,
      deliveredFrom: new Date("2026-01-01T00:00:00.000Z"),
      deliveredTo: new Date("2026-01-31T00:00:00.000Z"),
    });
    expect(inRange.items).toHaveLength(1);
    expect(inRange.items[0]?.cooperativeId).toBe(cooperativeAId);

    const outOfRange = await listServiceDeliveries({
      page: 1,
      pageSize: 20,
      serviceTypeId: serviceTypeAId,
      deliveredFrom: new Date("2026-03-01T00:00:00.000Z"),
      deliveredTo: new Date("2026-03-31T00:00:00.000Z"),
    });
    expect(outOfRange.items).toHaveLength(0);

    const otherService = await listServiceDeliveries({
      page: 1,
      pageSize: 20,
      serviceTypeId: serviceTypeBId,
      deliveredFrom: new Date("2026-03-01T00:00:00.000Z"),
      deliveredTo: new Date("2026-03-31T00:00:00.000Z"),
    });
    expect(otherService.items).toHaveLength(1);
    expect(otherService.items[0]?.cooperativeId).toBe(cooperativeBId);
    expect(otherService.items[0]?.programId).toBeNull();
  });

  it("writes an audit log on create", async () => {
    const audit = await prisma.auditLog.findFirst({
      where: { actorId, action: "SERVICE_DELIVERY_CREATE" },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("ServiceDelivery");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });
});
