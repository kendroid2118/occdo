import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { createCooperative } from "@/lib/dal/cooperatives";
import {
  ComplianceRequirementInactiveError,
} from "@/lib/dal/compliance-requirements";
import {
  ComplianceRecordScopeError,
  ComplianceVerifyError,
  createComplianceRecord,
  getComplianceRecordById,
  listComplianceRecords,
  verifyComplianceRecord,
} from "@/lib/dal/compliance-records";
import { prisma } from "@/lib/dal/prisma";

const prefix = "occdo-032";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("compliance record DAL", () => {
  let actorId = "";
  let otherActorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let activeRequirementId = "";
  let inactiveRequirementId = "";
  let recordId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.complianceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [actorEmail, `${prefix}-other@example.invalid`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.complianceRequirement.deleteMany({
      where: { code: { in: [`${prefix}-ACTIVE`, `${prefix}-INACTIVE`] } },
    });

    const [actor, otherActor, coopType, sector, barangay, coopStatus, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-032 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.user.create({
          data: {
            email: `${prefix}-other@example.invalid`,
            name: "OCCDO-032 Other",
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
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    otherActorId = otherActor.id;

    const [activeReq, inactiveReq] = await Promise.all([
      prisma.complianceRequirement.create({
        data: {
          code: `${prefix}-ACTIVE`,
          name: "Active requirement",
          frequency: "ANNUAL",
          sortOrder: 1,
        },
        select: { id: true },
      }),
      prisma.complianceRequirement.create({
        data: {
          code: `${prefix}-INACTIVE`,
          name: "Inactive requirement",
          frequency: "ANNUAL",
          sortOrder: 2,
          isActive: false,
        },
        select: { id: true },
      }),
    ]);
    activeRequirementId = activeReq.id;
    inactiveRequirementId = inactiveReq.id;

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
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Compliance Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Compliance Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    const created = await createComplianceRecord({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        requirementId: activeRequirementId,
        reportingPeriod: "2026",
        dueDate: new Date("2026-12-31T00:00:00.000Z"),
        submittedDate: null,
        remarks: null,
      },
    });
    recordId = created.id;
  });

  afterAll(async () => {
    await prisma.complianceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId: { in: [actorId, otherActorId] } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.complianceRequirement.deleteMany({
      where: { code: { in: [`${prefix}-ACTIVE`, `${prefix}-INACTIVE`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({
      where: { email: { in: [actorEmail, `${prefix}-other@example.invalid`] } },
    });
    await prisma.$disconnect();
  });

  it("rejects new records against inactive requirements", async () => {
    await expect(
      createComplianceRecord({
        actorId,
        input: {
          cooperativeId: cooperativeAId,
          requirementId: inactiveRequirementId,
          reportingPeriod: "2026-Q1",
          dueDate: new Date("2026-03-31T00:00:00.000Z"),
          submittedDate: null,
          remarks: null,
        },
      }),
    ).rejects.toBeInstanceOf(ComplianceRequirementInactiveError);
  });

  it("keeps historical records readable after the requirement is deactivated", async () => {
    await prisma.complianceRequirement.update({
      where: { id: activeRequirementId },
      data: { isActive: false },
    });

    const listed = await listComplianceRecords({
      page: 1,
      pageSize: 20,
      cooperativeId: cooperativeAId,
    });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.id).toBe(recordId);
    expect(listed.items[0]?.requirement.id).toBe(activeRequirementId);
    expect(listed.items[0]?.requirement.isActive).toBe(false);
    expect(listed.items[0]).not.toHaveProperty("contactNumber");
    expect(JSON.stringify(listed.items)).not.toContain("09170000000");

    const loaded = await getComplianceRecordById(recordId);
    expect(loaded?.requirement.name).toBe("Active requirement");

    await prisma.complianceRequirement.update({
      where: { id: activeRequirementId },
      data: { isActive: true },
    });
  });

  it("sets verifier from the session actor and rejects spoofed scope or repeat verify", async () => {
    await expect(
      verifyComplianceRecord({
        actorId,
        input: { id: recordId, cooperativeId: cooperativeBId },
      }),
    ).rejects.toBeInstanceOf(ComplianceRecordScopeError);

    const verified = await verifyComplianceRecord({
      actorId,
      input: { id: recordId, cooperativeId: cooperativeAId },
    });
    expect(verified.verifiedById).toBe(actorId);
    expect(verified.verifiedById).not.toBe(otherActorId);
    expect(verified.status.code).toBe("VERIFIED");
    expect(verified.verifiedAt).toBeTruthy();
    expect(verified.verifiedBy?.name).toBe("OCCDO-032 Actor");

    await expect(
      verifyComplianceRecord({
        actorId: otherActorId,
        input: { id: recordId, cooperativeId: cooperativeAId },
      }),
    ).rejects.toBeInstanceOf(ComplianceVerifyError);

    const audit = await prisma.auditLog.findFirst({
      where: { actorId, action: "COMPLIANCE_RECORD_VERIFY", entityId: recordId },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("ComplianceRecord");
    expect(JSON.stringify(audit?.metadata)).toContain(actorId);
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });
});
