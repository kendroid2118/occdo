import "server-only";

import { prisma } from "@/lib/dal/prisma";

const referenceSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

export type ReferenceRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

const activeOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

export async function listActiveCooperativeTypes(): Promise<ReferenceRecord[]> {
  return prisma.cooperativeType.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveCooperativeSectors(): Promise<ReferenceRecord[]> {
  return prisma.cooperativeSector.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveCooperativeStatuses(): Promise<ReferenceRecord[]> {
  return prisma.cooperativeStatus.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveAccreditationStatuses(): Promise<ReferenceRecord[]> {
  return prisma.accreditationStatus.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveBarangays(): Promise<ReferenceRecord[]> {
  return prisma.barangay.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveOfficerPositions(): Promise<ReferenceRecord[]> {
  return prisma.officerPosition.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveAccreditationCaseTypes(): Promise<ReferenceRecord[]> {
  return prisma.accreditationCaseType.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveAccreditationCaseStatuses(): Promise<ReferenceRecord[]> {
  return prisma.accreditationCaseStatus.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActivePrograms(): Promise<ReferenceRecord[]> {
  return prisma.program.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}

export async function listActiveServiceTypes(): Promise<ReferenceRecord[]> {
  return prisma.serviceType.findMany({
    where: { isActive: true },
    select: referenceSelect,
    orderBy: activeOrder,
  });
}
