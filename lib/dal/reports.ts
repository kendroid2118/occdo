import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/dal/prisma";
import {
  REPORT_TIME_ZONE,
  manilaCalendarDateRange,
  manilaDateTimeRange,
  toManilaCalendarDate,
  toUtcCalendarDate,
} from "@/lib/reports/manila-date-range";
import type { ReportFiltersInput } from "@/lib/validation/reports";

const REPORT_COOPERATIVE_OPTION_CAP = 500;

const catalogSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const cooperativeReportSelect = {
  id: true,
  cooperativeCode: true,
  name: true,
  acronym: true,
  dateRegistered: true,
  type: { select: catalogSelect },
  sector: { select: catalogSelect },
  barangay: { select: catalogSelect },
  status: { select: catalogSelect },
  accreditationStatus: { select: catalogSelect },
} as const;

const membershipCurrentSelect = {
  id: true,
  cooperativeCode: true,
  name: true,
  totalMembers: true,
  maleMembers: true,
  femaleMembers: true,
} as const;

export class ReportFilterError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Invalid report filter");
    this.name = "ReportFilterError";
  }
}

export type ReportCatalogRef = {
  id: string;
  code: string;
  name: string;
};

export type ReportCooperativeOption = {
  id: string;
  cooperativeCode: string;
  name: string;
};

export type ReportFiltersApplied = {
  timeZone: typeof REPORT_TIME_ZONE;
  dateFrom: string | null;
  dateTo: string | null;
  cooperativeId?: string;
  typeId?: string;
  sectorId?: string;
  barangayId?: string;
  statusId?: string;
  accreditationStatusId?: string;
};

export type CooperativeReportRow = {
  id: string;
  cooperativeCode: string;
  name: string;
  acronym: string | null;
  dateRegistered: string | null;
  type: ReportCatalogRef;
  sector: ReportCatalogRef;
  barangay: ReportCatalogRef;
  status: ReportCatalogRef;
  accreditationStatus: ReportCatalogRef;
};

export type CooperativeReport = {
  filters: ReportFiltersApplied;
  items: CooperativeReportRow[];
  page: number;
  pageSize: number;
  total: number;
};

export type MembershipCurrentRow = {
  cooperativeId: string;
  cooperativeCode: string;
  name: string;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
};

export type MembershipCurrentTotals = {
  cooperatives: number;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
};

export type MembershipSnapshotRow = {
  cooperativeId: string;
  cooperativeCode: string;
  name: string;
  asOfDate: string;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
};

export type MembershipReport = {
  filters: ReportFiltersApplied;
  current: {
    items: MembershipCurrentRow[];
    totals: MembershipCurrentTotals;
    page: number;
    pageSize: number;
    total: number;
  };
  historical: {
    items: MembershipSnapshotRow[];
    page: number;
    pageSize: number;
    total: number;
  };
};

function appliedFilters(input: ReportFiltersInput): ReportFiltersApplied {
  return {
    timeZone: REPORT_TIME_ZONE,
    dateFrom: input.dateFrom ?? null,
    dateTo: input.dateTo ?? null,
    cooperativeId: input.cooperativeId,
    typeId: input.typeId,
    sectorId: input.sectorId,
    barangayId: input.barangayId,
    statusId: input.statusId,
    accreditationStatusId: input.accreditationStatusId,
  };
}

function catalogWhere(input: ReportFiltersInput): Prisma.CooperativeWhereInput {
  const where: Prisma.CooperativeWhereInput = {};
  if (input.cooperativeId) {
    where.id = input.cooperativeId;
  }
  if (input.typeId) {
    where.typeId = input.typeId;
  }
  if (input.sectorId) {
    where.sectorId = input.sectorId;
  }
  if (input.barangayId) {
    where.barangayId = input.barangayId;
  }
  if (input.statusId) {
    where.statusId = input.statusId;
  }
  if (input.accreditationStatusId) {
    where.accreditationStatusId = input.accreditationStatusId;
  }
  return where;
}

function cooperativeReportWhere(input: ReportFiltersInput): Prisma.CooperativeWhereInput {
  const where = catalogWhere(input);
  if (input.dateFrom && input.dateTo) {
    const range = manilaDateTimeRange(input.dateFrom, input.dateTo);
    where.dateRegistered = {
      gte: range.startInclusive,
      lt: range.endExclusive,
    };
  }
  return where;
}

function snapshotWhere(input: ReportFiltersInput): Prisma.MembershipSnapshotWhereInput {
  const where: Prisma.MembershipSnapshotWhereInput = {
    cooperative: catalogWhere(input),
  };
  if (input.dateFrom && input.dateTo) {
    const range = manilaCalendarDateRange(input.dateFrom, input.dateTo);
    where.asOfDate = {
      gte: range.startInclusive,
      lt: range.endExclusive,
    };
  }
  return where;
}

async function assertReportFilters(input: ReportFiltersInput): Promise<void> {
  const [type, sector, barangay, status, accreditation, cooperative] = await Promise.all([
    input.typeId
      ? prisma.cooperativeType.findFirst({
          where: { id: input.typeId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
    input.sectorId
      ? prisma.cooperativeSector.findFirst({
          where: { id: input.sectorId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
    input.barangayId
      ? prisma.barangay.findFirst({
          where: { id: input.barangayId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
    input.statusId
      ? prisma.cooperativeStatus.findFirst({
          where: { id: input.statusId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
    input.accreditationStatusId
      ? prisma.accreditationStatus.findFirst({
          where: { id: input.accreditationStatusId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
    input.cooperativeId
      ? prisma.cooperative.findUnique({
          where: { id: input.cooperativeId },
          select: { id: true },
        })
      : Promise.resolve({ id: "unused" }),
  ]);

  if (!type || !sector || !barangay || !status || !accreditation || !cooperative) {
    throw new ReportFilterError();
  }
}

export async function listReportCooperativeOptions(): Promise<ReportCooperativeOption[]> {
  return prisma.cooperative.findMany({
    select: {
      id: true,
      cooperativeCode: true,
      name: true,
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: REPORT_COOPERATIVE_OPTION_CAP,
  });
}

export async function getCooperativeReport(
  input: ReportFiltersInput,
): Promise<CooperativeReport> {
  await assertReportFilters(input);
  const where = cooperativeReportWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, rows] = await prisma.$transaction([
    prisma.cooperative.count({ where }),
    prisma.cooperative.findMany({
      where,
      select: cooperativeReportSelect,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    filters: appliedFilters(input),
    items: rows.map((row) => ({
      id: row.id,
      cooperativeCode: row.cooperativeCode,
      name: row.name,
      acronym: row.acronym,
      dateRegistered: row.dateRegistered ? toManilaCalendarDate(row.dateRegistered) : null,
      type: row.type,
      sector: row.sector,
      barangay: row.barangay,
      status: row.status,
      accreditationStatus: row.accreditationStatus,
    })),
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}

export async function getMembershipReport(
  input: ReportFiltersInput,
): Promise<MembershipReport> {
  await assertReportFilters(input);
  const currentWhere = catalogWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [currentTotal, currentRows, currentSums] = await prisma.$transaction([
    prisma.cooperative.count({ where: currentWhere }),
    prisma.cooperative.findMany({
      where: currentWhere,
      select: membershipCurrentSelect,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip,
      take: input.pageSize,
    }),
    prisma.cooperative.aggregate({
      where: currentWhere,
      _sum: {
        totalMembers: true,
        maleMembers: true,
        femaleMembers: true,
      },
    }),
  ]);

  const historical =
    input.dateFrom && input.dateTo
      ? await prisma.$transaction([
          prisma.membershipSnapshot.count({ where: snapshotWhere(input) }),
          prisma.membershipSnapshot.findMany({
            where: snapshotWhere(input),
            select: {
              cooperativeId: true,
              asOfDate: true,
              totalMembers: true,
              maleMembers: true,
              femaleMembers: true,
              cooperative: {
                select: { cooperativeCode: true, name: true },
              },
            },
            orderBy: [
              { asOfDate: "desc" },
              { cooperative: { name: "asc" } },
              { id: "asc" },
            ],
            skip,
            take: input.pageSize,
          }),
        ])
      : ([0, []] as const);
  const [historicalTotal, historicalRows] = historical;

  return {
    filters: appliedFilters(input),
    current: {
      items: currentRows.map((row) => ({
        cooperativeId: row.id,
        cooperativeCode: row.cooperativeCode,
        name: row.name,
        totalMembers: row.totalMembers,
        maleMembers: row.maleMembers,
        femaleMembers: row.femaleMembers,
      })),
      totals: {
        cooperatives: currentTotal,
        totalMembers: currentSums._sum.totalMembers ?? 0,
        maleMembers: currentSums._sum.maleMembers ?? 0,
        femaleMembers: currentSums._sum.femaleMembers ?? 0,
      },
      page: input.page,
      pageSize: input.pageSize,
      total: currentTotal,
    },
    historical: {
      items: historicalRows.map((row) => ({
        cooperativeId: row.cooperativeId,
        cooperativeCode: row.cooperative.cooperativeCode,
        name: row.cooperative.name,
        asOfDate: toUtcCalendarDate(row.asOfDate),
        totalMembers: row.totalMembers,
        maleMembers: row.maleMembers,
        femaleMembers: row.femaleMembers,
      })),
      page: input.page,
      pageSize: input.pageSize,
      total: historicalTotal,
    },
  };
}
