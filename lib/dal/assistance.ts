import "server-only";

import { Prisma } from "@prisma/client";

import { ASSISTANCE_STATUS_CODES } from "@/lib/assistance/status-codes";
import { writeAuditLog } from "@/lib/dal/audit";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type { ReferenceRecord } from "@/lib/dal/reference";
import type {
  CreateAssistanceRecordInput,
  ListAssistanceRecordsInput,
  TransitionAssistanceRecordInput,
  UpdateAssistanceAmountInput,
} from "@/lib/validation/assistance";
import type { CreateCatalogItemInput } from "@/lib/validation/program";

export class AssistanceRecordNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Assistance record not found");
    this.name = "AssistanceRecordNotFoundError";
  }
}

export class AssistanceScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Assistance record does not belong to this cooperative");
    this.name = "AssistanceScopeError";
  }
}

export class AssistanceTransitionError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Assistance record cannot change status from its current state");
    this.name = "AssistanceTransitionError";
  }
}

export class AssistanceCatalogConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Catalog code is already in use");
    this.name = "AssistanceCatalogConflictError";
  }
}

const catalogSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const recordSelect = {
  id: true,
  cooperativeId: true,
  assistanceTypeId: true,
  amount: true,
  requestedAt: true,
  approvedAt: true,
  releasedAt: true,
  statusId: true,
  fundSource: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  assistanceType: { select: referenceNameSelect },
  status: { select: referenceNameSelect },
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
} as const;

type AssistanceRecordRow = Prisma.AssistanceRecordGetPayload<{
  select: typeof recordSelect;
}>;

export type AssistanceRecord = Omit<AssistanceRecordRow, "amount"> & {
  amount: string;
};

export type AssistanceRecordListResult = {
  items: AssistanceRecord[];
  page: number;
  pageSize: number;
  total: number;
};

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function serializeRecord(row: AssistanceRecordRow): AssistanceRecord {
  return {
    ...row,
    amount: row.amount.toFixed(2),
  };
}

function recordSnapshot(row: AssistanceRecord) {
  return {
    cooperativeId: row.cooperativeId,
    assistanceTypeId: row.assistanceTypeId,
    amount: row.amount,
    statusId: row.statusId,
    statusCode: row.status.code,
    requestedAt: row.requestedAt,
    approvedAt: row.approvedAt,
    releasedAt: row.releasedAt,
    fundSource: row.fundSource,
  };
}

function catalogSnapshot(row: ReferenceRecord) {
  return {
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function listWhere(input: ListAssistanceRecordsInput): Prisma.AssistanceRecordWhereInput {
  const where: Prisma.AssistanceRecordWhereInput = {};
  if (input.cooperativeId) {
    where.cooperativeId = input.cooperativeId;
  }
  if (input.assistanceTypeId) {
    where.assistanceTypeId = input.assistanceTypeId;
  }
  if (input.statusId) {
    where.statusId = input.statusId;
  }
  return where;
}

async function requireStatusByCode(
  tx: Prisma.TransactionClient,
  code: string,
): Promise<{ id: string; code: string }> {
  const status = await tx.assistanceStatus.findFirst({
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
): Promise<AssistanceRecord> {
  const existing = await tx.assistanceRecord.findUnique({
    where: { id: input.id },
    select: recordSelect,
  });
  if (!existing) {
    throw new AssistanceRecordNotFoundError();
  }
  if (existing.cooperativeId !== input.cooperativeId) {
    throw new AssistanceScopeError();
  }
  return serializeRecord(existing);
}

export async function createAssistanceType(options: {
  input: CreateCatalogItemInput;
  actorId: string;
}): Promise<ReferenceRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.assistanceType.create({
        data: {
          code: options.input.code,
          name: options.input.name,
          description: options.input.description,
          sortOrder: options.input.sortOrder,
        },
        select: catalogSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "ASSISTANCE_TYPE_CREATE",
          entityType: "AssistanceType",
          entityId: created.id,
          source: "WEB",
          metadata: { after: catalogSnapshot(created) },
        },
        tx,
      );

      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new AssistanceCatalogConflictError();
    }
    throw error;
  }
}

export async function createAssistanceRecord(options: {
  input: CreateAssistanceRecordInput;
  actorId: string;
}): Promise<AssistanceRecord> {
  return prisma.$transaction(async (tx) => {
    const [cooperative, assistanceType, requestedStatus] = await Promise.all([
      tx.cooperative.findUnique({
        where: { id: options.input.cooperativeId },
        select: { id: true },
      }),
      tx.assistanceType.findFirst({
        where: { id: options.input.assistanceTypeId, isActive: true },
        select: { id: true },
      }),
      requireStatusByCode(tx, ASSISTANCE_STATUS_CODES.REQUESTED),
    ]);

    if (!cooperative) {
      throw new CooperativeNotFoundError();
    }
    if (!assistanceType) {
      throw new CooperativeReferenceError();
    }

    const created = await tx.assistanceRecord.create({
      data: {
        cooperativeId: cooperative.id,
        assistanceTypeId: assistanceType.id,
        amount: options.input.amount,
        requestedAt: options.input.requestedAt,
        statusId: requestedStatus.id,
        fundSource: options.input.fundSource,
        remarks: options.input.remarks,
        createdById: options.actorId,
        updatedById: options.actorId,
      },
      select: recordSelect,
    });
    const record = serializeRecord(created);

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "ASSISTANCE_CREATE",
        entityType: "AssistanceRecord",
        entityId: record.id,
        source: "WEB",
        metadata: { after: recordSnapshot(record) },
      },
      tx,
    );

    return record;
  });
}

export async function updateAssistanceAmount(options: {
  input: UpdateAssistanceAmountInput;
  actorId: string;
}): Promise<AssistanceRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await loadScopedRecord(tx, options.input);
    if (existing.status.code !== ASSISTANCE_STATUS_CODES.REQUESTED) {
      throw new AssistanceTransitionError();
    }

    const updated = serializeRecord(
      await tx.assistanceRecord.update({
        where: { id: existing.id },
        data: {
          amount: options.input.amount,
          updatedById: options.actorId,
        },
        select: recordSelect,
      }),
    );

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "ASSISTANCE_AMOUNT_UPDATE",
        entityType: "AssistanceRecord",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: { amount: existing.amount },
          after: { amount: updated.amount },
        },
      },
      tx,
    );

    return updated;
  });
}

async function transitionAssistanceStatus(options: {
  input: TransitionAssistanceRecordInput;
  actorId: string;
  fromCode: string;
  toCode: string;
  action: "ASSISTANCE_APPROVE" | "ASSISTANCE_RELEASE";
}): Promise<AssistanceRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await loadScopedRecord(tx, options.input);
    if (existing.status.code !== options.fromCode) {
      throw new AssistanceTransitionError();
    }

    const nextStatus = await requireStatusByCode(tx, options.toCode);
    const now = new Date();
    const updated = serializeRecord(
      await tx.assistanceRecord.update({
        where: { id: existing.id },
        data: {
          statusId: nextStatus.id,
          approvedAt:
            options.toCode === ASSISTANCE_STATUS_CODES.APPROVED ? now : existing.approvedAt,
          releasedAt:
            options.toCode === ASSISTANCE_STATUS_CODES.RELEASED ? now : existing.releasedAt,
          updatedById: options.actorId,
        },
        select: recordSelect,
      }),
    );

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: options.action,
        entityType: "AssistanceRecord",
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

export async function approveAssistanceRecord(options: {
  input: TransitionAssistanceRecordInput;
  actorId: string;
}): Promise<AssistanceRecord> {
  return transitionAssistanceStatus({
    ...options,
    fromCode: ASSISTANCE_STATUS_CODES.REQUESTED,
    toCode: ASSISTANCE_STATUS_CODES.APPROVED,
    action: "ASSISTANCE_APPROVE",
  });
}

export async function releaseAssistanceRecord(options: {
  input: TransitionAssistanceRecordInput;
  actorId: string;
}): Promise<AssistanceRecord> {
  return transitionAssistanceStatus({
    ...options,
    fromCode: ASSISTANCE_STATUS_CODES.APPROVED,
    toCode: ASSISTANCE_STATUS_CODES.RELEASED,
    action: "ASSISTANCE_RELEASE",
  });
}

export async function getAssistanceRecordById(
  id: string,
): Promise<AssistanceRecord | null> {
  const row = await prisma.assistanceRecord.findUnique({
    where: { id },
    select: recordSelect,
  });
  return row ? serializeRecord(row) : null;
}

export async function listAssistanceRecords(
  input: ListAssistanceRecordsInput,
): Promise<AssistanceRecordListResult> {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;
  const [total, items] = await prisma.$transaction([
    prisma.assistanceRecord.count({ where }),
    prisma.assistanceRecord.findMany({
      where,
      select: recordSelect,
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items: items.map(serializeRecord),
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}
