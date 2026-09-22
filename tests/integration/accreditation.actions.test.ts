import { Role } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getCurrentSessionUser = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

import {
  decideAccreditationCaseAction,
  fileAccreditationCaseAction,
} from "@/lib/actions/accreditation";
import { createCooperative } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const prefix = "occdo-023";
const actorEmail = `${prefix}-admin@example.invalid`;

describe("accreditation case transition action", () => {
  let actorId = "";
  let cooperativeId = "";
  let typeId = "";
  let filedStatusId = "";
  let decidedStatusId = "";
  let pendingAccId = "";
  let accreditedAccId = "";

  beforeAll(async () => {
    await prisma.accreditationCase.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.accreditationCaseType.deleteMany({
      where: { code: `${prefix}-TYPE` },
    });
    await prisma.accreditationCaseStatus.deleteMany({
      where: { code: { in: [`${prefix}-FILED`, `${prefix}-DECIDED`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({
      where: { code: `${prefix}-CS` },
    });
    await prisma.accreditationStatus.deleteMany({
      where: { code: { in: [`${prefix}-PEND`, `${prefix}-OK`] } },
    });

    const [actor, coopType, sector, barangay, coopStatus, pendingAcc, accreditedAcc, caseType, filed, decided] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-023 Admin",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true, email: true, name: true, role: true, isActive: true },
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
          data: { code: `${prefix}-PEND`, name: "Pending", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationStatus.create({
          data: { code: `${prefix}-OK`, name: "Accredited", sortOrder: 2 },
          select: { id: true },
        }),
        prisma.accreditationCaseType.create({
          data: { code: `${prefix}-TYPE`, name: "Case Type", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationCaseStatus.create({
          data: { code: `${prefix}-FILED`, name: "Filed", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationCaseStatus.create({
          data: { code: `${prefix}-DECIDED`, name: "Decided", sortOrder: 2 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    typeId = caseType.id;
    filedStatusId = filed.id;
    decidedStatusId = decided.id;
    pendingAccId = pendingAcc.id;
    accreditedAccId = accreditedAcc.id;

    const cooperative = await createCooperative({
      actorId,
      input: {
        cooperativeCode: `${prefix}-A`,
        registrationNumber: null,
        name: "Accreditation Case Coop",
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
        accreditationStatusId: pendingAccId,
        statusId: coopStatus.id,
        totalMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        remarks: null,
      },
    });
    cooperativeId = cooperative.id;

    getCurrentSessionUser.mockResolvedValue({
      id: actor.id,
      email: actor.email,
      name: actor.name,
      role: "ADMIN",
      isActive: true,
    });
  });

  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockResolvedValue({
      id: actorId,
      email: actorEmail,
      name: "OCCDO-023 Admin",
      role: "ADMIN",
      isActive: true,
    });
  });

  afterAll(async () => {
    await prisma.accreditationCase.deleteMany({
      where: { cooperativeId },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.accreditationCaseType.deleteMany({
      where: { code: `${prefix}-TYPE` },
    });
    await prisma.accreditationCaseStatus.deleteMany({
      where: { code: { in: [`${prefix}-FILED`, `${prefix}-DECIDED`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({
      where: { code: `${prefix}-CS` },
    });
    await prisma.accreditationStatus.deleteMany({
      where: { code: { in: [`${prefix}-PEND`, `${prefix}-OK`] } },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("decides a case, updates cooperative accreditation fields, and audits", async () => {
    const filed = await fileAccreditationCaseAction({
      cooperativeId,
      typeId,
      statusId: filedStatusId,
    });
    expect(filed.ok).toBe(true);
    if (!filed.ok) {
      return;
    }

    const decided = await decideAccreditationCaseAction({
      id: filed.data.id,
      cooperativeId,
      statusId: decidedStatusId,
      accreditationStatusId: accreditedAccId,
    });
    expect(decided.ok).toBe(true);
    if (!decided.ok) {
      return;
    }

    expect(decided.data.statusId).toBe(decidedStatusId);
    expect(decided.data.decidedAt).not.toBeNull();

    const swapped = await decideAccreditationCaseAction({
      id: filed.data.id,
      cooperativeId: "not-this-cooperative",
      statusId: decidedStatusId,
      accreditationStatusId: accreditedAccId,
    });
    expect(swapped).toEqual({ ok: false, code: "FORBIDDEN" });

    const [cooperative, audit] = await Promise.all([
      prisma.cooperative.findUnique({
        where: { id: cooperativeId },
        select: { accreditationStatusId: true, dateAccredited: true },
      }),
      prisma.auditLog.findFirst({
        where: {
          action: "ACCREDITATION_CASE_DECIDE",
          entityId: filed.data.id,
        },
        select: { action: true, entityType: true, actorId: true, metadata: true },
      }),
    ]);

    expect(cooperative?.accreditationStatusId).toBe(accreditedAccId);
    expect(cooperative?.dateAccredited).not.toBeNull();
    expect(audit).toMatchObject({
      action: "ACCREDITATION_CASE_DECIDE",
      entityType: "AccreditationCase",
      actorId,
    });
  });
});
