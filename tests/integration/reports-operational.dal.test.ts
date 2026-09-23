import { AttendanceStatus, Role, TrainingKind } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  approveAssistanceRecord,
  createAssistanceRecord,
  releaseAssistanceRecord,
} from "@/lib/dal/assistance";
import { createComplianceRecord } from "@/lib/dal/compliance-records";
import { createCooperative } from "@/lib/dal/cooperatives";
import { createFundLedgerEntry } from "@/lib/dal/fund-ledger";
import { prisma } from "@/lib/dal/prisma";
import { ReportFilterError } from "@/lib/dal/reports";
import {
  getAssistanceReport,
  getComplianceReport,
  getSummaryReport,
  getTrainingReport,
} from "@/lib/dal/reports-operational";
import { createTrainingEvent } from "@/lib/dal/training-events";
import { createTrainingParticipant } from "@/lib/dal/training-participants";
import { reportFiltersSchema } from "@/lib/validation/reports";

const prefix = "occdo-038";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("operational reports DAL", () => {
  let actorId = "";
  let typeId = "";
  let assistanceTypeId = "";
  let unusedAssistanceTypeId = "";
  let requirementId = "";
  let includedCoopId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.fundLedgerEntry.deleteMany({
      where: { assistanceRecord: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } } },
    });
    await prisma.assistanceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingParticipant.deleteMany({
      where: { trainingEvent: { title: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.complianceRecord.deleteMany({
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
      where: { code: { in: [`${prefix}-AT`, `${prefix}-AT2`] } },
    });
    await prisma.complianceRequirement.deleteMany({ where: { code: `${prefix}-REQ` } });

    const [actor, coopType, sector, barangay, coopStatus, accreditation, assistType, unusedType] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-038 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.cooperativeType.create({
          data: { code: `${prefix}-CT`, name: "Ops type", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.cooperativeSector.findFirst({ where: { isActive: true }, select: { id: true } }),
        prisma.barangay.findFirst({ where: { isActive: true }, select: { id: true } }),
        prisma.cooperativeStatus.create({
          data: { code: `${prefix}-CS`, name: "Ops status", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.accreditationStatus.create({
          data: { code: `${prefix}-ACC`, name: "Ops accreditation", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.assistanceType.create({
          data: { code: `${prefix}-AT`, name: "Ops assistance", sortOrder: 1 },
          select: { id: true },
        }),
        prisma.assistanceType.create({
          data: { code: `${prefix}-AT2`, name: "Unused assistance", sortOrder: 2 },
          select: { id: true },
        }),
      ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    const requirement = await prisma.complianceRequirement.create({
      data: { code: `${prefix}-REQ`, name: "Inactive later", sortOrder: 1, isActive: true },
      select: { id: true },
    });

    actorId = actor.id;
    typeId = coopType.id;
    assistanceTypeId = assistType.id;
    unusedAssistanceTypeId = unusedType.id;
    requirementId = requirement.id;

    const coop = await createCooperative({
      actorId,
      input: {
        cooperativeCode: `${prefix}-IN`,
        name: "Ops Included Coop",
        registrationNumber: null,
        acronym: null,
        typeId,
        sectorId: sector.id,
        address: "Ormoc",
        barangayId: barangay.id,
        contactPerson: "Staff",
        contactNumber: "09170000000",
        email: null,
        dateRegistered: new Date("2026-08-31T16:00:00.000Z"),
        dateAccredited: null,
        accreditationStatusId: accreditation.id,
        statusId: coopStatus.id,
        totalMembers: 11,
        maleMembers: 4,
        femaleMembers: 5,
        remarks: null,
      },
    });
    includedCoopId = coop.id;

    const requestedOnly = await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: includedCoopId,
        assistanceTypeId,
        amount: "2000.00",
        requestedAt: new Date("2026-08-31T16:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    const toRelease = await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: includedCoopId,
        assistanceTypeId,
        amount: "1500.00",
        requestedAt: new Date("2026-09-15T00:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    await createAssistanceRecord({
      actorId,
      input: {
        cooperativeId: includedCoopId,
        assistanceTypeId,
        amount: "88.00",
        requestedAt: new Date("2026-09-30T16:00:00.000Z"),
        fundSource: "LGU",
        remarks: null,
      },
    });
    await approveAssistanceRecord({
      actorId,
      input: { id: toRelease.id, cooperativeId: includedCoopId },
    });
    await releaseAssistanceRecord({
      actorId,
      input: { id: toRelease.id, cooperativeId: includedCoopId },
    });
    await prisma.fundLedgerEntry.updateMany({
      where: { assistanceRecordId: toRelease.id, entryKind: "DISBURSEMENT" },
      data: { entryDate: new Date("2026-09-15T00:00:00.000Z") },
    });
    await createFundLedgerEntry({
      actorId,
      input: {
        assistanceRecordId: toRelease.id,
        cooperativeId: includedCoopId,
        entryDate: new Date("2026-09-16T00:00:00.000Z"),
        amount: "50.25",
        entryKind: "ADJUSTMENT",
        remarks: null,
      },
    });
    await createFundLedgerEntry({
      actorId,
      input: {
        assistanceRecordId: toRelease.id,
        cooperativeId: includedCoopId,
        entryDate: new Date("2026-09-17T00:00:00.000Z"),
        amount: "100.00",
        entryKind: "RECOVERY",
        remarks: null,
      },
    });
    void requestedOnly;

    const [includedEvent, excludedEvent] = await Promise.all([
      createTrainingEvent({
        actorId,
        input: {
          title: `${prefix}-training`,
          kind: TrainingKind.TRAINING,
          startAt: new Date("2026-08-31T16:00:00.000Z"),
          endAt: null,
          venue: "Ormoc Hall",
          programId: null,
          serviceTypeId: null,
          remarks: null,
        },
      }),
      createTrainingEvent({
        actorId,
        input: {
          title: `${prefix}-orientation`,
          kind: TrainingKind.ORIENTATION,
          startAt: new Date("2026-09-30T16:00:00.000Z"),
          endAt: null,
          venue: "Later Hall",
          programId: null,
          serviceTypeId: null,
          remarks: null,
        },
      }),
    ]);

    await Promise.all([
      createTrainingParticipant({
        actorId,
        input: {
          trainingEventId: includedEvent.id,
          cooperativeId: includedCoopId,
          fullName: "Present Person",
          attendanceStatus: AttendanceStatus.PRESENT,
          contactNumber: "09170000000",
        },
      }),
      createTrainingParticipant({
        actorId,
        input: {
          trainingEventId: includedEvent.id,
          cooperativeId: includedCoopId,
          fullName: "Absent Person",
          attendanceStatus: AttendanceStatus.ABSENT,
          contactNumber: null,
        },
      }),
      createTrainingParticipant({
        actorId,
        input: {
          trainingEventId: excludedEvent.id,
          cooperativeId: includedCoopId,
          fullName: "Later Person",
          attendanceStatus: AttendanceStatus.REGISTERED,
          contactNumber: null,
        },
      }),
    ]);

    await createComplianceRecord({
      actorId,
      input: {
        cooperativeId: includedCoopId,
        requirementId,
        reportingPeriod: "2026-Q3",
        dueDate: new Date("2026-08-31T16:00:00.000Z"),
        submittedDate: null,
        remarks: null,
      },
    });
    await prisma.complianceRequirement.update({
      where: { id: requirementId },
      data: { isActive: false },
    });
  });

  afterAll(async () => {
    await prisma.fundLedgerEntry.deleteMany({
      where: { assistanceRecord: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } } },
    });
    await prisma.assistanceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingParticipant.deleteMany({
      where: { trainingEvent: { title: { startsWith: `${prefix}-` } } },
    });
    await prisma.trainingEvent.deleteMany({
      where: { title: { startsWith: `${prefix}-` } },
    });
    await prisma.complianceRecord.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.assistanceType.deleteMany({
      where: { code: { in: [`${prefix}-AT`, `${prefix}-AT2`] } },
    });
    await prisma.complianceRequirement.deleteMany({ where: { code: `${prefix}-REQ` } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("uses ledger Decimals for money and Manila requested-date bounds", async () => {
    const report = await getAssistanceReport(
      reportFiltersSchema.parse({
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        typeId,
        assistanceTypeId,
      }),
    );

    expect(report.items.map((row) => row.requestedAmount).sort()).toEqual(["1500.00", "2000.00"]);
    expect(report.requestedTotal).toBe("3500.00");
    expect(report.ledger).toEqual({
      disbursed: "1500.00",
      adjustments: "50.25",
      recovered: "100.00",
      net: "1450.25",
    });
    expect(report.ledger.disbursed).not.toBe(report.requestedTotal);
    expect(JSON.stringify(report)).not.toContain("09170000000");
    expect(JSON.stringify(report)).not.toContain("passwordHash");
  });

  it("aggregates training kind and attendance without participant PII", async () => {
    const report = await getTrainingReport(
      reportFiltersSchema.parse({
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        typeId,
        trainingKind: "TRAINING",
      }),
    );

    expect(report.total).toBe(1);
    expect(report.items[0]?.kind).toBe("TRAINING");
    expect(report.items[0]?.attendance).toEqual({
      PRESENT: 1,
      ABSENT: 1,
      REGISTERED: 0,
    });
    expect(report.byKind).toEqual([{ kind: "TRAINING", count: 1 }]);
    expect(report.attendance).toEqual({ PRESENT: 1, ABSENT: 1, REGISTERED: 0 });
    expect(JSON.stringify(report)).not.toContain("Present Person");
    expect(JSON.stringify(report)).not.toContain("09170000000");
  });

  it("keeps compliance rows after the requirement is deactivated", async () => {
    const report = await getComplianceReport(
      reportFiltersSchema.parse({
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        typeId,
        complianceRequirementId: requirementId,
      }),
    );

    expect(report.total).toBe(1);
    expect(report.items[0]?.requirement.id).toBe(requirementId);
    expect(report.items[0]?.requirement.isActive).toBe(false);
    expect(report.byStatus[0]?.status.code).not.toBeUndefined();
    expect(report.byStatus[0]?.count).toBe(1);
  });

  it("summarizes live aggregates and rejects unknown catalog filters", async () => {
    const summary = await getSummaryReport(
      reportFiltersSchema.parse({
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        typeId,
      }),
    );

    expect(summary.cooperatives).toBe(1);
    expect(summary.membership.totalMembers).toBe(11);
    expect(summary.assistanceRecords).toBe(2);
    expect(summary.requestedTotal).toBe("3500.00");
    expect(summary.ledger.net).toBe("1450.25");
    expect(summary.trainingEvents).toBe(1);
    expect(summary.trainingAttendance.PRESENT).toBe(1);
    expect(summary.complianceRecords).toBe(1);
    expect(JSON.stringify(summary)).not.toContain("09170000000");

    const empty = await getAssistanceReport(
      reportFiltersSchema.parse({ assistanceTypeId: unusedAssistanceTypeId }),
    );
    expect(empty.items).toEqual([]);
    expect(empty.total).toBe(0);
    expect(empty.ledger.disbursed).toBe("0.00");

    await expect(
      getAssistanceReport(reportFiltersSchema.parse({ assistanceTypeId: "missing-type" })),
    ).rejects.toBeInstanceOf(ReportFilterError);
  });
});
