import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type {
  CreateOfficerInput,
  DeleteOfficerInput,
  UpdateOfficerInput,
} from "@/lib/validation/officer";

export class OfficerNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Officer not found");
    this.name = "OfficerNotFoundError";
  }
}

export class OfficerScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Officer does not belong to this cooperative");
    this.name = "OfficerScopeError";
  }
}

const officerSelect = {
  id: true,
  cooperativeId: true,
  positionId: true,
  fullName: true,
  contactNumber: true,
  email: true,
  isPrimaryContact: true,
  startDate: true,
  endDate: true,
  isActive: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  position: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
} as const;

export type OfficerRecord = Prisma.CooperativeOfficerGetPayload<{
  select: typeof officerSelect;
}>;

function officerWriteData(input: CreateOfficerInput) {
  return {
    cooperativeId: input.cooperativeId,
    positionId: input.positionId,
    fullName: input.fullName,
    contactNumber: input.contactNumber,
    email: input.email,
    isPrimaryContact: input.isPrimaryContact,
    startDate: input.startDate,
    endDate: input.endDate,
    isActive: input.isActive,
    remarks: input.remarks,
  };
}

function officerSnapshot(row: OfficerRecord) {
  return {
    cooperativeId: row.cooperativeId,
    positionId: row.positionId,
    fullName: row.fullName,
    isPrimaryContact: row.isPrimaryContact,
    isActive: row.isActive,
  };
}

async function assertOfficerScope(
  db: Prisma.TransactionClient,
  input: { id: string; cooperativeId: string },
): Promise<OfficerRecord> {
  const existing = await db.cooperativeOfficer.findUnique({
    where: { id: input.id },
    select: officerSelect,
  });
  if (!existing) {
    throw new OfficerNotFoundError();
  }
  if (existing.cooperativeId !== input.cooperativeId) {
    throw new OfficerScopeError();
  }
  return existing;
}

async function assertWritableReferences(
  db: Prisma.TransactionClient,
  input: { cooperativeId: string; positionId: string },
): Promise<void> {
  const [cooperative, position] = await Promise.all([
    db.cooperative.findUnique({
      where: { id: input.cooperativeId },
      select: { id: true },
    }),
    db.officerPosition.findFirst({
      where: { id: input.positionId, isActive: true },
      select: { id: true },
    }),
  ]);

  if (!cooperative) {
    throw new CooperativeNotFoundError();
  }
  if (!position) {
    throw new CooperativeReferenceError();
  }
}

async function clearOtherPrimaryContacts(
  db: Prisma.TransactionClient,
  cooperativeId: string,
  exceptId?: string,
): Promise<void> {
  await db.cooperativeOfficer.updateMany({
    where: {
      cooperativeId,
      isPrimaryContact: true,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    data: { isPrimaryContact: false },
  });
}

export async function listOfficersByCooperativeId(
  cooperativeId: string,
): Promise<OfficerRecord[]> {
  return prisma.cooperativeOfficer.findMany({
    where: { cooperativeId },
    select: officerSelect,
    orderBy: [{ isPrimaryContact: "desc" }, { fullName: "asc" }],
  });
}

export async function createOfficer(options: {
  input: CreateOfficerInput;
  actorId: string;
}): Promise<OfficerRecord> {
  return prisma.$transaction(async (tx) => {
    await assertWritableReferences(tx, options.input);
    if (options.input.isPrimaryContact) {
      await clearOtherPrimaryContacts(tx, options.input.cooperativeId);
    }

    const created = await tx.cooperativeOfficer.create({
      data: officerWriteData(options.input),
      select: officerSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "OFFICER_CREATE",
        entityType: "CooperativeOfficer",
        entityId: created.id,
        source: "WEB",
        metadata: { after: officerSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}

export async function updateOfficer(options: {
  input: UpdateOfficerInput;
  actorId: string;
}): Promise<OfficerRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await assertOfficerScope(tx, options.input);
    await assertWritableReferences(tx, options.input);
    if (options.input.isPrimaryContact) {
      await clearOtherPrimaryContacts(tx, existing.cooperativeId, existing.id);
    }

    const updated = await tx.cooperativeOfficer.update({
      where: { id: existing.id },
      data: {
        ...officerWriteData(options.input),
        cooperativeId: existing.cooperativeId,
      },
      select: officerSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "OFFICER_UPDATE",
        entityType: "CooperativeOfficer",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: officerSnapshot(existing),
          after: officerSnapshot(updated),
        },
      },
      tx,
    );

    return updated;
  });
}

export async function deleteOfficer(options: {
  input: DeleteOfficerInput;
  actorId: string;
}): Promise<{ id: string }> {
  return prisma.$transaction(async (tx) => {
    const existing = await assertOfficerScope(tx, options.input);
    await tx.cooperativeOfficer.delete({ where: { id: existing.id } });
    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "OFFICER_DELETE",
        entityType: "CooperativeOfficer",
        entityId: existing.id,
        source: "WEB",
        metadata: { before: officerSnapshot(existing) },
      },
      tx,
    );
    return { id: existing.id };
  });
}
