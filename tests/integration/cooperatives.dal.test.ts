import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/dal/prisma";
import {
  createCooperative,
  listCooperatives,
} from "@/lib/dal/cooperatives";
import { listCooperativesSchema } from "@/lib/validation/cooperative";

const prefix = "occdo-018";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("cooperatives DAL list filter", () => {
  let typeAId = "";
  let typeBId = "";
  let sectorId = "";
  let barangayId = "";
  let statusId = "";
  let accreditationId = "";
  let actorId = "";

  beforeAll(async () => {
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({
      where: { code: { in: [`${prefix}-TYPE-A`, `${prefix}-TYPE-B`] } },
    });
    await prisma.cooperativeStatus.deleteMany({
      where: { code: `${prefix}-STATUS` },
    });
    await prisma.accreditationStatus.deleteMany({
      where: { code: `${prefix}-ACC` },
    });

    const [actor, typeA, typeB, sector, barangay, status, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-018 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-TYPE-A`, name: "Type A", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-TYPE-B`, name: "Type B", sortOrder: 2 },
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
          data: { code: `${prefix}-STATUS`, name: "Status", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationStatus.create({
          data: { code: `${prefix}-ACC`, name: "Accreditation", sortOrder: 1 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    typeAId = typeA.id;
    typeBId = typeB.id;
    sectorId = sector.id;
    barangayId = barangay.id;
    statusId = status.id;
    accreditationId = accreditation.id;

    const base = {
      sectorId,
      address: "Ormoc",
      barangayId,
      contactPerson: "Staff",
      contactNumber: "09170000000",
      accreditationStatusId: accreditationId,
      statusId,
      totalMembers: 0,
      maleMembers: 0,
      femaleMembers: 0,
      remarks: null,
      acronym: null,
      email: null,
      registrationNumber: null,
      dateRegistered: null,
      dateAccredited: null,
    };

    await createCooperative({
      actorId,
      input: {
        ...base,
        cooperativeCode: `${prefix}-A`,
        name: "Alpha Filter Coop",
        typeId: typeAId,
      },
    });
    await createCooperative({
      actorId,
      input: {
        ...base,
        cooperativeCode: `${prefix}-B`,
        name: "Beta Filter Coop",
        typeId: typeBId,
      },
    });
  });

  afterAll(async () => {
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId },
    });
    await prisma.cooperativeType.deleteMany({
      where: { code: { in: [`${prefix}-TYPE-A`, `${prefix}-TYPE-B`] } },
    });
    await prisma.cooperativeStatus.deleteMany({
      where: { code: `${prefix}-STATUS` },
    });
    await prisma.accreditationStatus.deleteMany({
      where: { code: `${prefix}-ACC` },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("filters cooperatives by typeId at the database", async () => {
    const query = listCooperativesSchema.parse({
      typeId: typeAId,
      search: prefix,
      pageSize: 20,
    });
    const result = await listCooperatives(query);
    const codes = result.items.map((row) => row.cooperativeCode);

    expect(result.total).toBe(1);
    expect(codes).toEqual([`${prefix}-A`]);
    expect(result.items[0]).not.toHaveProperty("passwordHash");
    expect(result.items[0]?.type.id).toBe(typeAId);
  });
});
