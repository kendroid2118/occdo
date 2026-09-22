import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { prisma } from "@/lib/dal/prisma";
import { createCooperative } from "@/lib/dal/cooperatives";
import {
  membershipAsOfDate,
  updateCooperativeMembership,
} from "@/lib/dal/membership";

const prefix = "occdo-022";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("membership DAL transactional update", () => {
  let actorId = "";
  let cooperativeId = "";

  beforeAll(async () => {
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({
      where: { code: `${prefix}-TYPE` },
    });
    await prisma.cooperativeStatus.deleteMany({
      where: { code: `${prefix}-STATUS` },
    });
    await prisma.accreditationStatus.deleteMany({
      where: { code: `${prefix}-ACC` },
    });

    const [actor, type, sector, barangay, status, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-022 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-TYPE`, name: "Type", sortOrder: 1 },
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
    const created = await createCooperative({
      actorId,
      input: {
        cooperativeCode: `${prefix}-A`,
        registrationNumber: null,
        name: "Membership Snapshot Coop",
        acronym: null,
        typeId: type.id,
        sectorId: sector.id,
        address: "Ormoc",
        barangayId: barangay.id,
        contactPerson: "Staff",
        contactNumber: "09170000000",
        email: null,
        dateRegistered: null,
        dateAccredited: null,
        accreditationStatusId: accreditation.id,
        statusId: status.id,
        totalMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        remarks: null,
      },
    });
    cooperativeId = created.id;
  });

  afterAll(async () => {
    await prisma.membershipSnapshot.deleteMany({
      where: { cooperativeId },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperativeType.deleteMany({
      where: { code: `${prefix}-TYPE` },
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

  it("updates master counts and the snapshot in one transaction", async () => {
    const updated = await updateCooperativeMembership({
      actorId,
      input: {
        cooperativeId,
        totalMembers: 10,
        maleMembers: 4,
        femaleMembers: 5,
      },
    });

    const [master, snapshot, audit] = await Promise.all([
      prisma.cooperative.findUnique({
        where: { id: cooperativeId },
        select: {
          totalMembers: true,
          maleMembers: true,
          femaleMembers: true,
        },
      }),
      prisma.membershipSnapshot.findUnique({
        where: {
          cooperativeId_asOfDate: {
            cooperativeId,
            asOfDate: membershipAsOfDate(),
          },
        },
      }),
      prisma.auditLog.findFirst({
        where: {
          actorId,
          action: "MEMBERSHIP_UPDATE",
          entityId: cooperativeId,
        },
        select: { action: true, entityType: true, metadata: true },
      }),
    ]);

    expect(updated.totalMembers).toBe(10);
    expect(updated.maleMembers).toBe(4);
    expect(updated.femaleMembers).toBe(5);
    expect(master).toEqual({
      totalMembers: 10,
      maleMembers: 4,
      femaleMembers: 5,
    });
    expect(snapshot).toMatchObject({
      cooperativeId,
      totalMembers: 10,
      maleMembers: 4,
      femaleMembers: 5,
      source: "PROFILE_UPDATE",
      recordedById: actorId,
    });
    expect(audit).toMatchObject({
      action: "MEMBERSHIP_UPDATE",
      entityType: "Cooperative",
    });
    expect(4 + 5).not.toBe(10);
  });
});
