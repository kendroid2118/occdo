import "server-only";

import { Prisma } from "@prisma/client";

import { COMPLIANCE_STATUS_CODES } from "@/lib/compliance/status-codes";
import { writeAuditLog } from "@/lib/dal/audit";
import { requireActiveComplianceRequirement } from "@/lib/dal/compliance-requirements";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type { ReferenceRecord } from "@/lib/dal/reference";
import type {
  CreateComplianceRecordInput,
  ListComplianceRecordsInput,
  VerifyComplianceRecordInput,
} from "@/lib/validation/compliance-record";

export class ComplianceRecordNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Compliance record not found");
    this.name = "ComplianceRecordNotFoundError";
  }
}

export class ComplianceRecordScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Compliance record does not belong to this cooperative");
    this.name = "ComplianceRecordScopeError";
  }
}

export class ComplianceRecordConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("A compliance record already exists for this period");
    this.name = "ComplianceRecordConflictError";
  }
}

export class ComplianceVerifyError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Compliance record cannot be verified from its current state");
    this.name = "ComplianceVerifyError";
  }
}

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
  isActive: true,
} as const;

const recordSelect = {
  id: true,
  cooperativeId: true,
  requirementId: true,
  reportingPeriod: true,
  dueDate: true,
  submittedDate: true,
  statusId: true,
  remarks: true,
  verifiedById: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  requirement: { select: referenceNameSelect },
  status: { select: { id: true, code: true, name: true } },
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
  verifiedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export type ComplianceRecord = Prisma.ComplianceRecordGetPayload<{
  select: typeof recordSelect;
}>;

export type ComplianceRecordListResult = {
  items: ComplianceRecord[];
  page: number;
  pageSize: number;
  total: number;
};

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function recordSnapshot(row: ComplianceRecord) {
  return {
    cooperativeId: row.cooperativeId,
    requirementId: row.requirementId,
    reportingPeriod: row.reportingPeriod,
    statusId: row.statusId,
    statusCode: row.status.code,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt,
  };
}

async function requireStatusByCode(
  tx: Prisma.TransactionClient,
  code: string,
): Promise<{ id: string; code: string }> {
  const status = await tx.complianceStatus.findFirst({
    where: { code, isActive: true },
    select: { id: true, code: true },
  });
  if (!status) {
    throw new CooperativeReferenceError();
  }
  return status;
}

async function loadScopedRecord(
  tx: Prisma.TransactionClient,
  input: { id: string; cooperativeId: string },
): Promise<ComplianceRecord> {
  const existing = await tx.complianceRecord.findUnique({
    where: { id: input.id },
    select: recordSelect,
  });
  if (!existing) {
    throw new ComplianceRecordNotFoundError();
  }
  if (existing.cooperativeId !== input.cooperativeId) {
    throw new ComplianceRecordScopeError();
  }
  return existing;
}

function listWhere(input: ListComplianceRecordsInput): Prisma.ComplianceRecordWhereInput {
  const where: Prisma.ComplianceRecordWhereInput = {};
  if (input.cooperativeId) {
    where.cooperativeId = input.cooperativeId;
  }
  if (input.requirementId) {
    where.requirementId = input.requirementId;
  }
  if (input.statusId) {
    where.statusId = input.statusId;
  }
  return where;
}

export async function createComplianceRecord(options: {
  input: CreateComplianceRecordInput;
  actorId: string;
}): Promise<ComplianceRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const [cooperative, requirement, pendingStatus] = await Promise.all([
        tx.cooperative.findUnique({
          where: { id: options.input.cooperativeId },
          select: { id: true },
        }),
        requireActiveComplianceRequirement(options.input.requirementId, tx),
        requireStatusByCode(tx, COMPLIANCE_STATUS_CODES.PENDING),
      ]);

      if (!cooperative) {
        throw new CooperativeNotFoundError();
      }

      const created = await tx.complianceRecord.create({
        data: {
          cooperativeId: cooperative.id,
          requirementId: requirement.id,
          reportingPeriod: options.input.reportingPeriod,
          dueDate: options.input.dueDate,
          submittedDate: options.input.submittedDate,
          statusId: pendingStatus.id,
          remarks: options.input.remarks,
          createdById: options.actorId,
        },
        select: recordSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "COMPLIANCE_RECORD_CREATE",
          entityType: "ComplianceRecord",
          entityId: created.id,
          source: "WEB",
          metadata: { after: recordSnapshot(created) },
        },
        tx,
      );

      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new ComplianceRecordConflictError();
    }
    throw error;
  }
}

export async function verifyComplianceRecord(options: {
  input: VerifyComplianceRecordInput;
  actorId: string;
}): Promise<ComplianceRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await loadScopedRecord(tx, options.input);
    if (existing.status.code === COMPLIANCE_STATUS_CODES.VERIFIED || existing.verifiedById) {
      throw new ComplianceVerifyError();
    }

    const verifiedStatus = await requireStatusByCode(tx, COMPLIANCE_STATUS_CODES.VERIFIED);
    const verifiedAt = new Date();
    const updated = await tx.complianceRecord.update({
      where: { id: existing.id },
      data: {
        statusId: verifiedStatus.id,
        verifiedById: options.actorId,
        verifiedAt,
        submittedDate: existing.submittedDate ?? verifiedAt,
      },
      select: recordSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "COMPLIANCE_RECORD_VERIFY",
        entityType: "ComplianceRecord",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: recordSnapshot(existing),
          after: recordSnapshot(updated),
        },
      },
      tx,
    );

    return updated;
  });
}

export async function getComplianceRecordById(
  id: string,
): Promise<ComplianceRecord | null> {
  return prisma.complianceRecord.findUnique({
    where: { id },
    select: recordSelect,
  });
}

export async function listComplianceRecords(
  input: ListComplianceRecordsInput,
): Promise<ComplianceRecordListResult> {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;
  const [total, items] = await prisma.$transaction([
    prisma.complianceRecord.count({ where }),
    prisma.complianceRecord.findMany({
      where,
      select: recordSelect,
      orderBy: [{ dueDate: "desc" }, { id: "desc" }],
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

export async function listActiveComplianceStatuses(): Promise<ReferenceRecord[]> {
  return prisma.complianceStatus.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      sortOrder: true,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
