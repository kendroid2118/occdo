import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  approveAssistanceRecord,
  AssistanceScopeError,
  AssistanceTransitionError,
  createAssistanceRecord,
  listAssistanceRecords,
  releaseAssistanceRecord,
  updateAssistanceAmount,
} from "@/lib/dal/assistance";
import { createCooperative } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { listActiveAssistanceTypes } from "@/lib/dal/reference";

const prefix = "occdo-029";
const actorEmail = `${prefix}-actor@example.invalid`;
const inactiveTypeCode = `${prefix}-INACTIVE`;

describe("assistance DAL amount, status, and audit", () => {
  let actorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let typeAId = "";
  let typeBId = "";
  let recordAId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.assistanceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.assistanceType.deleteMany({
      where: { code: { in: [`${prefix}-TYPE-A`, `${prefix}-TYPE-B`, inactiveTypeCode] } },
    });

    const [actor, coopType, sector, barangay, coopStatus, accreditation, typeA, typeB] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-029 Actor",
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
        prisma.assistanceType.create({
          data: { code: `${prefix}-TYPE-A`, name: "Type A", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.assistanceType.create({
          data: { code: `${prefix}-TYPE-B`, name: "Type B", sortOrder: 2 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    typeAId = typeA.id;
    typeBId = typeB.id;

    await prisma.assistanceType.create({
      data: {
        code: inactiveTypeCode,
        name: "Inactive type",
        sortOrder: 999,
        isActive: false,
      },
    });

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
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Assist Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Assist Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    const recordA = await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        assistanceTypeId: typeAId,
        amount: "1500.00",
        requestedAt: new Date("2026-09-10T00:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    recordAId = recordA.id;

    await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: cooperativeBId,
        assistanceTypeId: typeBId,
        amount: "250.25",
        requestedAt: new Date("2026-09-20T00:00:00.000Z"),
        fundSource: null,
        remarks: null,
      },
    });
  });

  afterAll(async () => {
    await prisma.assistanceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.assistanceType.deleteMany({
      where: { code: { in: [`${prefix}-TYPE-A`, `${prefix}-TYPE-B`, inactiveTypeCode] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("lists by cooperative without contact PII", async () => {
    const result = await listAssistanceRecords({
      page: 1,
      pageSize: 20,
      cooperativeId: cooperativeAId,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(recordAId);
    expect(result.items[0]?.amount).toBe("1500.00");
    expect(result.items[0]?.cooperativeId).toBe(cooperativeAId);
    expect(result.items[0]).not.toHaveProperty("contactNumber");
    expect(JSON.stringify(result.items)).not.toContain("09170000000");
    expect(JSON.stringify(result.items)).not.toContain("passwordHash");
  });

  it("excludes inactive assistance types from the active catalog", async () => {
    const types = await listActiveAssistanceTypes();
    const codes = types.map((row) => row.code);
    expect(codes).toContain(`${prefix}-TYPE-A`);
    expect(codes).not.toContain(inactiveTypeCode);
  });

  it("audits amount changes and status transitions", async () => {
    const updated = await updateAssistanceAmount({
      actorId,
      input: { id: recordAId, cooperativeId: cooperativeAId, amount: "1750.50" },
    });
    expect(updated.amount).toBe("1750.50");

    const approved = await approveAssistanceRecord({
      actorId,
      input: { id: recordAId, cooperativeId: cooperativeAId },
    });
    expect(approved.status.code).toBe("APPROVED");
    expect(approved.approvedAt).toBeTruthy();

    await expect(
      updateAssistanceAmount({
        actorId,
        input: { id: recordAId, cooperativeId: cooperativeAId, amount: "1.00" },
      }),
    ).rejects.toBeInstanceOf(AssistanceTransitionError);

    await expect(
      approveAssistanceRecord({
        actorId,
        input: { id: recordAId, cooperativeId: cooperativeBId },
      }),
    ).rejects.toBeInstanceOf(AssistanceScopeError);

    const released = await releaseAssistanceRecord({
      actorId,
      input: { id: recordAId, cooperativeId: cooperativeAId },
    });
    expect(released.status.code).toBe("RELEASED");

    const amountAudit = await prisma.auditLog.findFirst({
      where: { actorId, action: "ASSISTANCE_AMOUNT_UPDATE", entityId: recordAId },
      select: { metadata: true },
    });
    expect(JSON.stringify(amountAudit?.metadata)).toContain("1500.00");
    expect(JSON.stringify(amountAudit?.metadata)).toContain("1750.50");

    const approveAudit = await prisma.auditLog.findFirst({
      where: { actorId, action: "ASSISTANCE_APPROVE", entityId: recordAId },
      select: { entityType: true, metadata: true },
    });
    expect(approveAudit?.entityType).toBe("AssistanceRecord");
    const approveJson = JSON.stringify(approveAudit?.metadata);
    expect(approveJson).toContain("REQUESTED");
    expect(approveJson).toContain("APPROVED");
    expect(approveJson).not.toContain("passwordHash");
    expect(approveJson).not.toContain("bank");
  });
});
