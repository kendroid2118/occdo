import "server-only";

import { Prisma, type AttendanceStatus, type FundLedgerEntryKind, type TrainingKind } from "@prisma/client";

import { prisma } from "@/lib/dal/prisma";
import {
  appliedFilters,
  assertReportFilters,
  catalogWhere,
  reportDateTimeRange,
  type ReportCatalogRef,
  type ReportFiltersApplied,
} from "@/lib/dal/reports";
import { toManilaCalendarDate } from "@/lib/reports/manila-date-range";
import type { ReportFiltersInput } from "@/lib/validation/reports";

const ZERO = new Prisma.Decimal("0.00");

const catalogSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const cooperativeCodeSelect = {
  id: true,
  cooperativeCode: true,
  name: true,
} as const;

export type LedgerMoneyTotals = {
  disbursed: string;
  adjustments: string;
  recovered: string;
  net: string;
};

export type AssistanceReportRow = {
  id: string;
  cooperativeCode: string;
  name: string;
  assistanceType: ReportCatalogRef;
  status: ReportCatalogRef;
  requestedAmount: string;
  requestedAt: string;
  approvedAt: string | null;
  releasedAt: string | null;
};

export type AssistanceReport = {
  filters: ReportFiltersApplied;
  items: AssistanceReportRow[];
  requestedTotal: string;
  ledger: LedgerMoneyTotals;
  page: number;
  pageSize: number;
  total: number;
};

export type TrainingAttendanceCounts = Record<AttendanceStatus, number>;

export type TrainingReportRow = {
  id: string;
  title: string;
  kind: TrainingKind;
  startAt: string;
  venue: string;
  program: ReportCatalogRef | null;
  serviceType: ReportCatalogRef | null;
  attendance: TrainingAttendanceCounts;
};

export type TrainingKindCount = {
  kind: TrainingKind;
  count: number;
};

export type TrainingReport = {
  filters: ReportFiltersApplied;
  items: TrainingReportRow[];
  byKind: TrainingKindCount[];
  attendance: TrainingAttendanceCounts;
  page: number;
  pageSize: number;
  total: number;
};

export type ComplianceReportRow = {
  id: string;
  cooperativeCode: string;
  name: string;
  requirement: ReportCatalogRef & { isActive: boolean };
  status: ReportCatalogRef;
  reportingPeriod: string;
  dueDate: string;
  submittedDate: string | null;
};

export type ComplianceStatusCount = {
  status: ReportCatalogRef;
  count: number;
};

export type ComplianceReport = {
  filters: ReportFiltersApplied;
  items: ComplianceReportRow[];
  byStatus: ComplianceStatusCount[];
  page: number;
  pageSize: number;
  total: number;
};

export type SummaryReport = {
  filters: ReportFiltersApplied;
  cooperatives: number;
  membership: {
    totalMembers: number;
    maleMembers: number;
    femaleMembers: number;
  };
  assistanceRecords: number;
  requestedTotal: string;
  ledger: LedgerMoneyTotals;
  trainingEvents: number;
  trainingByKind: TrainingKindCount[];
  trainingAttendance: TrainingAttendanceCounts;
  complianceRecords: number;
  complianceByStatus: ComplianceStatusCount[];
};

function emptyAttendance(): TrainingAttendanceCounts {
  return { REGISTERED: 0, PRESENT: 0, ABSENT: 0 };
}

function hasCooperativeScope(input: ReportFiltersInput): boolean {
  return Boolean(
    input.cooperativeId ||
      input.typeId ||
      input.sectorId ||
      input.barangayId ||
      input.statusId ||
      input.accreditationStatusId,
  );
}

function assistanceWhere(input: ReportFiltersInput): Prisma.AssistanceRecordWhereInput {
  const where: Prisma.AssistanceRecordWhereInput = {
    cooperative: catalogWhere(input),
  };
  if (input.assistanceTypeId) {
    where.assistanceTypeId = input.assistanceTypeId;
  }
  const range = reportDateTimeRange(input);
  if (range) {
    where.requestedAt = range;
  }
  return where;
}

function ledgerWhere(input: ReportFiltersInput): Prisma.FundLedgerEntryWhereInput {
  const where: Prisma.FundLedgerEntryWhereInput = {
    assistanceRecord: {
      cooperative: catalogWhere(input),
      ...(input.assistanceTypeId ? { assistanceTypeId: input.assistanceTypeId } : {}),
    },
  };
  const range = reportDateTimeRange(input);
  if (range) {
    where.entryDate = range;
  }
  return where;
}

function trainingWhere(input: ReportFiltersInput): Prisma.TrainingEventWhereInput {
  const where: Prisma.TrainingEventWhereInput = {};
  if (input.trainingKind) {
    where.kind = input.trainingKind;
  }
  if (input.programId) {
    where.programId = input.programId;
  }
  if (input.serviceTypeId) {
    where.serviceTypeId = input.serviceTypeId;
  }
  const range = reportDateTimeRange(input);
  if (range) {
    where.startAt = range;
  }
  if (hasCooperativeScope(input)) {
    where.participants = { some: { cooperative: catalogWhere(input) } };
  }
  return where;
}

function participantWhere(input: ReportFiltersInput): Prisma.TrainingParticipantWhereInput {
  const where: Prisma.TrainingParticipantWhereInput = {
    trainingEvent: trainingWhere(input),
  };
  if (hasCooperativeScope(input)) {
    where.cooperative = catalogWhere(input);
  }
  return where;
}

function complianceWhere(input: ReportFiltersInput): Prisma.ComplianceRecordWhereInput {
  const where: Prisma.ComplianceRecordWhereInput = {
    cooperative: catalogWhere(input),
  };
  if (input.complianceStatusId) {
    where.statusId = input.complianceStatusId;
  }
  if (input.complianceRequirementId) {
    where.requirementId = input.complianceRequirementId;
  }
  const range = reportDateTimeRange(input);
  if (range) {
    where.dueDate = range;
  }
  return where;
}

async function sumLedger(where: Prisma.FundLedgerEntryWhereInput): Promise<LedgerMoneyTotals> {
  const grouped = await prisma.fundLedgerEntry.groupBy({
    by: ["entryKind"],
    where,
    _sum: { amount: true },
  });

  const amounts: Record<FundLedgerEntryKind, Prisma.Decimal> = {
    DISBURSEMENT: ZERO,
    ADJUSTMENT: ZERO,
    RECOVERY: ZERO,
  };
  for (const row of grouped) {
    amounts[row.entryKind] = row._sum.amount ?? ZERO;
  }
  const net = amounts.DISBURSEMENT.plus(amounts.ADJUSTMENT).minus(amounts.RECOVERY);
  return {
    disbursed: amounts.DISBURSEMENT.toFixed(2),
    adjustments: amounts.ADJUSTMENT.toFixed(2),
    recovered: amounts.RECOVERY.toFixed(2),
    net: net.toFixed(2),
  };
}

async function requestedAmountTotal(
  where: Prisma.AssistanceRecordWhereInput,
): Promise<string> {
  const aggregate = await prisma.assistanceRecord.aggregate({
    where,
    _sum: { amount: true },
  });
  return (aggregate._sum.amount ?? ZERO).toFixed(2);
}

async function trainingKindCounts(
  where: Prisma.TrainingEventWhereInput,
): Promise<TrainingKindCount[]> {
  const grouped = await prisma.trainingEvent.groupBy({
    by: ["kind"],
    where,
    _count: { id: true },
    orderBy: { kind: "asc" },
  });
  return grouped.map((row) => ({ kind: row.kind, count: row._count.id }));
}

async function attendanceCounts(
  where: Prisma.TrainingParticipantWhereInput,
): Promise<TrainingAttendanceCounts> {
  const grouped = await prisma.trainingParticipant.groupBy({
    by: ["attendanceStatus"],
    where,
    _count: { id: true },
  });
  const counts = emptyAttendance();
  for (const row of grouped) {
    counts[row.attendanceStatus] = row._count.id;
  }
  return counts;
}

async function complianceStatusCounts(
  where: Prisma.ComplianceRecordWhereInput,
): Promise<ComplianceStatusCount[]> {
  const [grouped, statuses] = await Promise.all([
    prisma.complianceRecord.groupBy({
      by: ["statusId"],
      where,
      _count: { id: true },
    }),
    prisma.complianceStatus.findMany({
      select: catalogSelect,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);
  const countById = new Map(grouped.map((row) => [row.statusId, row._count.id]));
  return statuses
    .map((status) => ({
      status,
      count: countById.get(status.id) ?? 0,
    }))
    .filter((row) => row.count > 0);
}

export async function getAssistanceReport(
  input: ReportFiltersInput,
): Promise<AssistanceReport> {
  await assertReportFilters(input);
  const where = assistanceWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, rows, requestedTotal, ledger] = await Promise.all([
    prisma.assistanceRecord.count({ where }),
    prisma.assistanceRecord.findMany({
      where,
      select: {
        id: true,
        amount: true,
        requestedAt: true,
        approvedAt: true,
        releasedAt: true,
        assistanceType: { select: catalogSelect },
        status: { select: catalogSelect },
        cooperative: { select: cooperativeCodeSelect },
      },
      orderBy: [{ requestedAt: "desc" }, { id: "asc" }],
      skip,
      take: input.pageSize,
    }),
    requestedAmountTotal(where),
    sumLedger(ledgerWhere(input)),
  ]);

  return {
    filters: appliedFilters(input),
    items: rows.map((row) => ({
      id: row.id,
      cooperativeCode: row.cooperative.cooperativeCode,
      name: row.cooperative.name,
      assistanceType: row.assistanceType,
      status: row.status,
      requestedAmount: row.amount.toFixed(2),
      requestedAt: toManilaCalendarDate(row.requestedAt),
      approvedAt: row.approvedAt ? toManilaCalendarDate(row.approvedAt) : null,
      releasedAt: row.releasedAt ? toManilaCalendarDate(row.releasedAt) : null,
    })),
    requestedTotal,
    ledger,
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}

export async function getTrainingReport(input: ReportFiltersInput): Promise<TrainingReport> {
  await assertReportFilters(input);
  const where = trainingWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, rows, byKind, attendance] = await Promise.all([
    prisma.trainingEvent.count({ where }),
    prisma.trainingEvent.findMany({
      where,
      select: {
        id: true,
        title: true,
        kind: true,
        startAt: true,
        venue: true,
        program: { select: catalogSelect },
        serviceType: { select: catalogSelect },
      },
      orderBy: [{ startAt: "desc" }, { id: "asc" }],
      skip,
      take: input.pageSize,
    }),
    trainingKindCounts(where),
    attendanceCounts(participantWhere(input)),
  ]);

  const pageIds = rows.map((row) => row.id);
  const pageAttendance =
    pageIds.length === 0
      ? []
      : await prisma.trainingParticipant.groupBy({
          by: ["trainingEventId", "attendanceStatus"],
          where: {
            trainingEventId: { in: pageIds },
            ...(hasCooperativeScope(input) ? { cooperative: catalogWhere(input) } : {}),
          },
          _count: { id: true },
        });

  const attendanceByEvent = new Map<string, TrainingAttendanceCounts>();
  for (const row of pageAttendance) {
    const current = attendanceByEvent.get(row.trainingEventId) ?? emptyAttendance();
    current[row.attendanceStatus] = row._count.id;
    attendanceByEvent.set(row.trainingEventId, current);
  }

  return {
    filters: appliedFilters(input),
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      kind: row.kind,
      startAt: toManilaCalendarDate(row.startAt),
      venue: row.venue,
      program: row.program,
      serviceType: row.serviceType,
      attendance: attendanceByEvent.get(row.id) ?? emptyAttendance(),
    })),
    byKind,
    attendance,
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}

export async function getComplianceReport(
  input: ReportFiltersInput,
): Promise<ComplianceReport> {
  await assertReportFilters(input);
  const where = complianceWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, rows, byStatus] = await Promise.all([
    prisma.complianceRecord.count({ where }),
    prisma.complianceRecord.findMany({
      where,
      select: {
        id: true,
        reportingPeriod: true,
        dueDate: true,
        submittedDate: true,
        requirement: { select: { ...catalogSelect, isActive: true } },
        status: { select: catalogSelect },
        cooperative: { select: cooperativeCodeSelect },
      },
      orderBy: [{ dueDate: "desc" }, { id: "asc" }],
      skip,
      take: input.pageSize,
    }),
    complianceStatusCounts(where),
  ]);

  return {
    filters: appliedFilters(input),
    items: rows.map((row) => ({
      id: row.id,
      cooperativeCode: row.cooperative.cooperativeCode,
      name: row.cooperative.name,
      requirement: row.requirement,
      status: row.status,
      reportingPeriod: row.reportingPeriod,
      dueDate: toManilaCalendarDate(row.dueDate),
      submittedDate: row.submittedDate ? toManilaCalendarDate(row.submittedDate) : null,
    })),
    byStatus,
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}

export async function getSummaryReport(input: ReportFiltersInput): Promise<SummaryReport> {
  await assertReportFilters(input);
  const cooperativeWhere = catalogWhere(input);
  const assistWhere = assistanceWhere(input);
  const eventWhere = trainingWhere(input);
  const recordWhere = complianceWhere(input);

  const [
    cooperatives,
    membership,
    assistanceRecords,
    requestedTotal,
    ledger,
    trainingEvents,
    trainingByKind,
    trainingAttendance,
    complianceRecords,
    complianceByStatus,
  ] = await Promise.all([
    prisma.cooperative.count({ where: cooperativeWhere }),
    prisma.cooperative.aggregate({
      where: cooperativeWhere,
      _sum: {
        totalMembers: true,
        maleMembers: true,
        femaleMembers: true,
      },
    }),
    prisma.assistanceRecord.count({ where: assistWhere }),
    requestedAmountTotal(assistWhere),
    sumLedger(ledgerWhere(input)),
    prisma.trainingEvent.count({ where: eventWhere }),
    trainingKindCounts(eventWhere),
    attendanceCounts(participantWhere(input)),
    prisma.complianceRecord.count({ where: recordWhere }),
    complianceStatusCounts(recordWhere),
  ]);

  return {
    filters: appliedFilters(input),
    cooperatives,
    membership: {
      totalMembers: membership._sum.totalMembers ?? 0,
      maleMembers: membership._sum.maleMembers ?? 0,
      femaleMembers: membership._sum.femaleMembers ?? 0,
    },
    assistanceRecords,
    requestedTotal,
    ledger,
    trainingEvents,
    trainingByKind,
    trainingAttendance,
    complianceRecords,
    complianceByStatus,
  };
}
