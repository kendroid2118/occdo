import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type {
  CreateCooperativeInput,
  ListCooperativesInput,
  UpdateCooperativeInput,
} from "@/lib/validation/cooperative";

export class CooperativeConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Cooperative conflict");
    this.name = "CooperativeConflictError";
  }
}

export class CooperativeNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Cooperative not found");
    this.name = "CooperativeNotFoundError";
  }
}

export class CooperativeReferenceError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Invalid cooperative reference");
    this.name = "CooperativeReferenceError";
  }
}

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
} as const;

export const cooperativeSelect = {
  id: true,
  cooperativeCode: true,
  registrationNumber: true,
  name: true,
  acronym: true,
  typeId: true,
  sectorId: true,
  address: true,
  barangayId: true,
  contactPerson: true,
  contactNumber: true,
  email: true,
  dateRegistered: true,
  dateAccredited: true,
  accreditationStatusId: true,
  statusId: true,
  totalMembers: true,
  maleMembers: true,
  femaleMembers: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  type: { select: referenceNameSelect },
  sector: { select: referenceNameSelect },
  barangay: { select: referenceNameSelect },
  status: { select: referenceNameSelect },
  accreditationStatus: { select: referenceNameSelect },
} as const;

export type CooperativeRecord = Prisma.CooperativeGetPayload<{
  select: typeof cooperativeSelect;
}>;

export type CooperativeListResult = {
  items: CooperativeRecord[];
  page: number;
  pageSize: number;
  total: number;
};

type CooperativeWriteFields = Omit<CreateCooperativeInput, never>;

function writeData(input: CooperativeWriteFields) {
  return {
    cooperativeCode: input.cooperativeCode,
    registrationNumber: input.registrationNumber,
    name: input.name,
    acronym: input.acronym,
    typeId: input.typeId,
    sectorId: input.sectorId,
    address: input.address,
    barangayId: input.barangayId,
    contactPerson: input.contactPerson,
    contactNumber: input.contactNumber,
    email: input.email,
    dateRegistered: input.dateRegistered,
    dateAccredited: input.dateAccredited,
    accreditationStatusId: input.accreditationStatusId,
    statusId: input.statusId,
    totalMembers: input.totalMembers,
    maleMembers: input.maleMembers,
    femaleMembers: input.femaleMembers,
    remarks: input.remarks,
  };
}

function auditSnapshot(row: {
  cooperativeCode: string;
  name: string;
  typeId: string;
  sectorId: string;
  barangayId: string;
  statusId: string;
  accreditationStatusId: string;
  totalMembers: number;
  maleMembers: number;
  femaleMembers: number;
}) {
  return {
    cooperativeCode: row.cooperativeCode,
    name: row.name,
    typeId: row.typeId,
    sectorId: row.sectorId,
    barangayId: row.barangayId,
    statusId: row.statusId,
    accreditationStatusId: row.accreditationStatusId,
    totalMembers: row.totalMembers,
    maleMembers: row.maleMembers,
    femaleMembers: row.femaleMembers,
  };
}

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function assertActiveReferences(
  db: Prisma.TransactionClient,
  ids: {
    typeId: string;
    sectorId: string;
    barangayId: string;
    statusId: string;
    accreditationStatusId: string;
  },
): Promise<void> {
  const [type, sector, barangay, status, accreditation] = await Promise.all([
    db.cooperativeType.findFirst({
      where: { id: ids.typeId, isActive: true },
      select: { id: true },
    }),
    db.cooperativeSector.findFirst({
      where: { id: ids.sectorId, isActive: true },
      select: { id: true },
    }),
    db.barangay.findFirst({
      where: { id: ids.barangayId, isActive: true },
      select: { id: true },
    }),
    db.cooperativeStatus.findFirst({
      where: { id: ids.statusId, isActive: true },
      select: { id: true },
    }),
    db.accreditationStatus.findFirst({
      where: { id: ids.accreditationStatusId, isActive: true },
      select: { id: true },
    }),
  ]);

  if (!type || !sector || !barangay || !status || !accreditation) {
    throw new CooperativeReferenceError();
  }
}

function listWhere(input: ListCooperativesInput): Prisma.CooperativeWhereInput {
  const where: Prisma.CooperativeWhereInput = {};

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
  if (input.search) {
    where.OR = [
      { name: { contains: input.search, mode: "insensitive" } },
      { cooperativeCode: { contains: input.search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function getCooperativeById(id: string): Promise<CooperativeRecord | null> {
  return prisma.cooperative.findUnique({
    where: { id },
    select: cooperativeSelect,
  });
}

export async function listCooperatives(
  input: ListCooperativesInput,
): Promise<CooperativeListResult> {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;
  const orderBy: Prisma.CooperativeOrderByWithRelationInput[] = [
    { [input.sortBy]: input.sortDirection },
    { id: input.sortDirection },
  ];

  const [total, items] = await prisma.$transaction([
    prisma.cooperative.count({ where }),
    prisma.cooperative.findMany({
      where,
      select: cooperativeSelect,
      orderBy,
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items,
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}

export async function createCooperative(options: {
  input: CreateCooperativeInput;
  actorId: string;
}): Promise<CooperativeRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      await assertActiveReferences(tx, options.input);

      const created = await tx.cooperative.create({
        data: {
          ...writeData(options.input),
          createdById: options.actorId,
          updatedById: options.actorId,
        },
        select: cooperativeSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "COOPERATIVE_CREATE",
          entityType: "Cooperative",
          entityId: created.id,
          source: "WEB",
          metadata: { after: auditSnapshot(created) },
        },
        tx,
      );

      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new CooperativeConflictError();
    }
    throw error;
  }
}

export async function updateCooperative(options: {
  input: UpdateCooperativeInput;
  actorId: string;
}): Promise<CooperativeRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.cooperative.findUnique({
        where: { id: options.input.id },
        select: cooperativeSelect,
      });
      if (!existing) {
        throw new CooperativeNotFoundError();
      }

      await assertActiveReferences(tx, options.input);

      const updated = await tx.cooperative.update({
        where: { id: options.input.id },
        data: {
          ...writeData(options.input),
          updatedById: options.actorId,
        },
        select: cooperativeSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "COOPERATIVE_UPDATE",
          entityType: "Cooperative",
          entityId: updated.id,
          source: "WEB",
          metadata: {
            before: auditSnapshot(existing),
            after: auditSnapshot(updated),
          },
        },
        tx,
      );

      return updated;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new CooperativeConflictError();
    }
    throw error;
  }
}
