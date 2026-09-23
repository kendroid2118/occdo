import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  approveAssistanceRecord,
  createAssistanceRecord,
  releaseAssistanceRecord,
} from "@/lib/dal/assistance";
import { createCooperative } from "@/lib/dal/cooperatives";
import {
  createFundLedgerEntry,
  FundLedgerConflictError,
  FundLedgerParentNotFoundError,
  FundLedgerScopeError,
  FundLedgerTransitionError,
  getFundLedgerSummary,
  insertReleaseDisbursement,
  listFundLedgerEntries,
} from "@/lib/dal/fund-ledger";
import { prisma } from "@/lib/dal/prisma";

const prefix = "occdo-030";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("fund ledger DAL integrity", () => {
  let actorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let typeId = "";
  let requestedId = "";
  let releasedId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.fundLedgerEntry.deleteMany({
      where: { assistanceRecord: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } } },
    });
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
    await prisma.assistanceType.deleteMany({ where: { code: `${prefix}-TYPE` } });

    const [actor, coopType, sector, barangay, coopStatus, accreditation, type] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-030 Actor",
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
          data: { code: `${prefix}-TYPE`, name: "Ledger Type", sortOrder: 1 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;
    typeId = type.id;

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
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Ledger Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Ledger Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    const requested = await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        assistanceTypeId: typeId,
        amount: "1500.00",
        requestedAt: new Date("2026-09-10T00:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    requestedId = requested.id;

    const toRelease = await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        assistanceTypeId: typeId,
        amount: "1500.00",
        requestedAt: new Date("2026-09-11T00:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    await approveAssistanceRecord({
      actorId,
      input: { id: toRelease.id, cooperativeId: cooperativeAId },
    });
    const released = await releaseAssistanceRecord({
      actorId,
      input: { id: toRelease.id, cooperativeId: cooperativeAId },
    });
    releasedId = released.id;
  });

  afterAll(async () => {
    await prisma.fundLedgerEntry.deleteMany({
      where: { assistanceRecord: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } } },
    });
    await prisma.assistanceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.assistanceType.deleteMany({ where: { code: `${prefix}-TYPE` } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("rejects entries without a parent assistance record", async () => {
    await expect(
      createFundLedgerEntry({
        actorId,
        input: {
          assistanceRecordId: "missing-parent",
          cooperativeId: cooperativeAId,
          entryDate: new Date("2026-09-22T00:00:00.000Z"),
          amount: "10.00",
          entryKind: "ADJUSTMENT",
          remarks: null,
        },
      }),
    ).rejects.toBeInstanceOf(FundLedgerParentNotFoundError);
  });

  it("rejects ledger writes before release and wrong cooperative scope", async () => {
    await expect(
      createFundLedgerEntry({
        actorId,
        input: {
          assistanceRecordId: requestedId,
          cooperativeId: cooperativeAId,
          entryDate: new Date("2026-09-22T00:00:00.000Z"),
          amount: "10.00",
          entryKind: "ADJUSTMENT",
          remarks: null,
        },
      }),
    ).rejects.toBeInstanceOf(FundLedgerTransitionError);

    await expect(
      listFundLedgerEntries({
        assistanceRecordId: releasedId,
        cooperativeId: cooperativeBId,
      }),
    ).rejects.toBeInstanceOf(FundLedgerScopeError);
  });

  it("writes disbursement atomically on release and keeps sums in Decimal", async () => {
    const entries = await listFundLedgerEntries({
      assistanceRecordId: releasedId,
      cooperativeId: cooperativeAId,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]?.entryKind).toBe("DISBURSEMENT");
    expect(entries[0]?.amount).toBe("1500.00");

    await createFundLedgerEntry({
      actorId,
      input: {
        assistanceRecordId: releasedId,
        cooperativeId: cooperativeAId,
        entryDate: new Date("2026-09-23T00:00:00.000Z"),
        amount: "50.25",
        entryKind: "ADJUSTMENT",
        remarks: null,
      },
    });
    await createFundLedgerEntry({
      actorId,
      input: {
        assistanceRecordId: releasedId,
        cooperativeId: cooperativeAId,
        entryDate: new Date("2026-09-24T00:00:00.000Z"),
        amount: "100.00",
        entryKind: "RECOVERY",
        remarks: null,
      },
    });

    const summary = await getFundLedgerSummary({
      assistanceRecordId: releasedId,
      cooperativeId: cooperativeAId,
    });
    expect(summary).toEqual({
      disbursed: "1500.00",
      adjustments: "50.25",
      recovered: "100.00",
      net: "1450.25",
    });
  });

  it("rejects a second disbursement for the same assistance record", async () => {
    await expect(
      prisma.$transaction((tx) =>
        insertReleaseDisbursement(tx, {
          assistanceRecordId: releasedId,
          amount: "1500.00",
          entryDate: new Date("2026-09-25T00:00:00.000Z"),
          actorId,
        }),
      ),
    ).rejects.toBeInstanceOf(FundLedgerConflictError);
  });

  it("audits ledger writes without secrets", async () => {
    const audits = await prisma.auditLog.findMany({
      where: { actorId, action: "FUND_LEDGER_CREATE" },
      select: { entityType: true, metadata: true },
    });
    const payloads = audits.map((audit) => JSON.stringify(audit.metadata));
    expect(audits.length).toBeGreaterThan(0);
    expect(audits.every((audit) => audit.entityType === "FundLedgerEntry")).toBe(true);
    expect(payloads.some((payload) => payload.includes("DISBURSEMENT"))).toBe(true);
    expect(payloads.every((payload) => !payload.includes("passwordHash"))).toBe(true);
    expect(payloads.every((payload) => !payload.includes("09170000000"))).toBe(true);
  });
});
