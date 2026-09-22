import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type {
  DecideAccreditationCaseInput,
  FileAccreditationCaseInput,
  ListAccreditationCasesInput,
} from "@/lib/validation/accreditation";

export class AccreditationCaseNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Accreditation case not found");
    this.name = "AccreditationCaseNotFoundError";
  }
}

export class AccreditationCaseScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Accreditation case does not belong to this cooperative");
    this.name = "AccreditationCaseScopeError";
  }
}

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const caseSelect = {
  id: true,
  cooperativeId: true,
  typeId: true,
  statusId: true,
  filedAt: true,
  decidedAt: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  type: { select: referenceNameSelect },
  status: { select: referenceNameSelect },
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
} as const;

export type AccreditationCaseRecord = Prisma.AccreditationCaseGetPayload<{
  select: typeof caseSelect;
}>;

function caseSnapshot(row: AccreditationCaseRecord) {
  return {
    cooperativeId: row.cooperativeId,
    typeId: row.typeId,
    statusId: row.statusId,
    filedAt: row.filedAt,
    decidedAt: row.decidedAt,
  };
}

export async function fileAccreditationCase(options: {
  input: FileAccreditationCaseInput;
  actorId: string;
}): Promise<AccreditationCaseRecord> {
  return prisma.$transaction(async (tx) => {
    const [cooperative, type, status] = await Promise.all([
      tx.cooperative.findUnique({
        where: { id: options.input.cooperativeId },
        select: { id: true },
      }),
      tx.accreditationCaseType.findFirst({
        where: { id: options.input.typeId, isActive: true },
        select: { id: true },
      }),
      tx.accreditationCaseStatus.findFirst({
        where: { id: options.input.statusId, isActive: true },
        select: { id: true },
      }),
    ]);

    if (!cooperative) {
      throw new CooperativeNotFoundError();
    }
    if (!type || !status) {
      throw new CooperativeReferenceError();
    }

    const created = await tx.accreditationCase.create({
      data: {
        cooperativeId: cooperative.id,
        typeId: type.id,
        statusId: status.id,
        filedAt: options.input.filedAt ?? new Date(),
        remarks: options.input.remarks,
        createdById: options.actorId,
        updatedById: options.actorId,
      },
      select: caseSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "ACCREDITATION_CASE_FILE",
        entityType: "AccreditationCase",
        entityId: created.id,
        source: "WEB",
        metadata: { after: caseSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}

export async function decideAccreditationCase(options: {
  input: DecideAccreditationCaseInput;
  actorId: string;
}): Promise<AccreditationCaseRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.accreditationCase.findUnique({
      where: { id: options.input.id },
      select: caseSelect,
    });
    if (!existing) {
      throw new AccreditationCaseNotFoundError();
    }
    if (existing.cooperativeId !== options.input.cooperativeId) {
      throw new AccreditationCaseScopeError();
    }

    const [status, accreditationStatus] = await Promise.all([
      tx.accreditationCaseStatus.findFirst({
        where: { id: options.input.statusId, isActive: true },
        select: { id: true },
      }),
      tx.accreditationStatus.findFirst({
        where: { id: options.input.accreditationStatusId, isActive: true },
        select: { id: true },
      }),
    ]);
    if (!status || !accreditationStatus) {
      throw new CooperativeReferenceError();
    }

    const decidedAt = options.input.decidedAt ?? new Date();

    const updated = await tx.accreditationCase.update({
      where: { id: existing.id },
      data: {
        statusId: status.id,
        decidedAt,
        remarks: options.input.remarks,
        updatedById: options.actorId,
        cooperativeId: existing.cooperativeId,
      },
      select: caseSelect,
    });

    await tx.cooperative.update({
      where: { id: existing.cooperativeId },
      data: {
        accreditationStatusId: accreditationStatus.id,
        dateAccredited: decidedAt,
        updatedById: options.actorId,
      },
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "ACCREDITATION_CASE_DECIDE",
        entityType: "AccreditationCase",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: caseSnapshot(existing),
          after: {
            ...caseSnapshot(updated),
            accreditationStatusId: accreditationStatus.id,
          },
        },
      },
      tx,
    );

    return updated;
  });
}

export type AccreditationCaseListResult = {
  items: AccreditationCaseRecord[];
  page: number;
  pageSize: number;
  total: number;
};

export async function listAccreditationCases(
  input: ListAccreditationCasesInput,
): Promise<AccreditationCaseListResult> {
  const where: Prisma.AccreditationCaseWhereInput = {};
  if (input.statusId) {
    where.statusId = input.statusId;
  }

  const skip = (input.page - 1) * input.pageSize;
  const [total, items] = await prisma.$transaction([
    prisma.accreditationCase.count({ where }),
    prisma.accreditationCase.findMany({
      where,
      select: caseSelect,
      orderBy: [{ filedAt: "desc" }, { id: "desc" }],
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

export async function getAccreditationCaseById(
  id: string,
): Promise<AccreditationCaseRecord | null> {
  return prisma.accreditationCase.findUnique({
    where: { id },
    select: caseSelect,
  });
}
