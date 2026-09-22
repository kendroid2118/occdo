import "server-only";

import { TrainingKind } from "@prisma/client";

import {
  mergeCatalogCounts,
  type DashboardCatalogCount,
} from "@/lib/dashboard/catalog-counts";
import { ONGOING_REGISTRATION_STATUS_CODE } from "@/lib/dashboard/status-codes";
import { utcCalendarYearRange } from "@/lib/dashboard/year-range";
import { listActiveComplianceStatuses } from "@/lib/dal/compliance-records";
import { prisma } from "@/lib/dal/prisma";
import {
  listActiveCooperativeSectors,
  listActiveCooperativeStatuses,
  listActiveCooperativeTypes,
} from "@/lib/dal/reference";

export type { DashboardCatalogCount };

export type DashboardKpis = {
  totalCooperatives: number;
  ongoingRegistrations: number;
  technicalAssistance: number;
  trainingsConducted: number;
  cooperativeOrientations: number;
  totalMembership: number;
};

export type DashboardSummary = {
  year: number;
  kpis: DashboardKpis;
  cooperativesByType: DashboardCatalogCount[];
  cooperativesBySector: DashboardCatalogCount[];
  cooperativesByStatus: DashboardCatalogCount[];
  ytdDeliveries: number;
  complianceByStatus: DashboardCatalogCount[];
};

type GroupedIdCount = {
  _count: { _all: number };
} & Record<string, unknown>;

function groupedCounts(rows: readonly GroupedIdCount[], key: string): { id: string; count: number }[] {
  return rows.map((row) => ({
    id: String(row[key]),
    count: row._count._all,
  }));
}

export async function getDashboardSummary(
  options: { asOf?: Date } = {},
): Promise<DashboardSummary> {
  const asOf = options.asOf ?? new Date();
  const { year, start, endExclusive } = utcCalendarYearRange(asOf);

  const [
    types,
    sectors,
    statuses,
    complianceStatuses,
    totalCooperatives,
    membershipAggregate,
    typeGroups,
    sectorGroups,
    statusGroups,
    ytdDeliveries,
    trainingsConducted,
    cooperativeOrientations,
    complianceGroups,
  ] = await Promise.all([
    listActiveCooperativeTypes(),
    listActiveCooperativeSectors(),
    listActiveCooperativeStatuses(),
    listActiveComplianceStatuses(),
    prisma.cooperative.count(),
    prisma.cooperative.aggregate({
      _sum: { totalMembers: true },
    }),
    prisma.cooperative.groupBy({
      by: ["typeId"],
      _count: { _all: true },
    }),
    prisma.cooperative.groupBy({
      by: ["sectorId"],
      _count: { _all: true },
    }),
    prisma.cooperative.groupBy({
      by: ["statusId"],
      _count: { _all: true },
    }),
    prisma.serviceDelivery.count({
      where: {
        deliveredAt: {
          gte: start,
          lt: endExclusive,
        },
      },
    }),
    prisma.trainingEvent.count({
      where: { kind: TrainingKind.TRAINING },
    }),
    prisma.trainingEvent.count({
      where: { kind: TrainingKind.ORIENTATION },
    }),
    prisma.complianceRecord.groupBy({
      by: ["statusId"],
      _count: { _all: true },
    }),
  ]);

  const cooperativesByStatus = mergeCatalogCounts(
    statuses,
    groupedCounts(statusGroups, "statusId"),
  );
  const ongoingStatus = statuses.find(
    (row) => row.code === ONGOING_REGISTRATION_STATUS_CODE,
  );
  const ongoingRegistrations = ongoingStatus
    ? (cooperativesByStatus.find((row) => row.id === ongoingStatus.id)?.count ?? 0)
    : 0;

  return {
    year,
    kpis: {
      totalCooperatives,
      ongoingRegistrations,
      technicalAssistance: ytdDeliveries,
      trainingsConducted,
      cooperativeOrientations,
      totalMembership: membershipAggregate._sum.totalMembers ?? 0,
    },
    cooperativesByType: mergeCatalogCounts(types, groupedCounts(typeGroups, "typeId")),
    cooperativesBySector: mergeCatalogCounts(
      sectors,
      groupedCounts(sectorGroups, "sectorId"),
    ),
    cooperativesByStatus,
    ytdDeliveries,
    complianceByStatus: mergeCatalogCounts(
      complianceStatuses,
      groupedCounts(complianceGroups, "statusId"),
    ),
  };
}
