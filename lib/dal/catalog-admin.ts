import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type { CatalogKind } from "@/lib/settings/access";
import { CATALOG_KIND_META } from "@/lib/settings/access";
import type {
  CreateCatalogAdminItemInput,
  UpdateCatalogAdminItemInput,
} from "@/lib/validation/catalog-admin";

export class CatalogAdminNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Catalog item not found");
    this.name = "CatalogAdminNotFoundError";
  }
}

export class CatalogAdminConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Catalog code is already in use");
    this.name = "CatalogAdminConflictError";
  }
}

export type CatalogAdminRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  frequency: string | null;
};

const catalogSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

const requirementSelect = {
  ...catalogSelect,
  frequency: true,
} as const;

const listOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function toRecord(
  row: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    sortOrder: number;
    isActive: boolean;
    frequency?: string | null;
  },
): CatalogAdminRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    frequency: row.frequency ?? null,
  };
}

function snapshot(row: CatalogAdminRecord) {
  return {
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    frequency: row.frequency,
  };
}

function writeData(input: {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  frequency?: string | null;
}) {
  return {
    code: input.code,
    name: input.name,
    description: input.description,
    sortOrder: input.sortOrder,
    isActive: input.isActive,
  };
}

async function findCatalogItem(
  db: Prisma.TransactionClient | typeof prisma,
  kind: CatalogKind,
  id: string,
): Promise<CatalogAdminRecord | null> {
  switch (kind) {
    case "sector":
      return db.cooperativeSector.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "type":
      return db.cooperativeType.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "status":
      return db.cooperativeStatus.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "barangay":
      return db.barangay.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "program":
      return db.program.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "assistanceType":
      return db.assistanceType.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
    case "requirement":
      return db.complianceRequirement
        .findUnique({ where: { id }, select: requirementSelect })
        .then((row) => (row ? toRecord(row) : null));
    case "documentType":
      return db.documentType.findUnique({ where: { id }, select: catalogSelect }).then((row) =>
        row ? toRecord(row) : null,
      );
  }
}

async function createCatalogRow(
  db: Prisma.TransactionClient,
  kind: CatalogKind,
  input: CreateCatalogAdminItemInput,
): Promise<CatalogAdminRecord> {
  const data = writeData(input);
  switch (kind) {
    case "sector":
      return toRecord(await db.cooperativeSector.create({ data, select: catalogSelect }));
    case "type":
      return toRecord(await db.cooperativeType.create({ data, select: catalogSelect }));
    case "status":
      return toRecord(await db.cooperativeStatus.create({ data, select: catalogSelect }));
    case "barangay":
      return toRecord(await db.barangay.create({ data, select: catalogSelect }));
    case "program":
      return toRecord(await db.program.create({ data, select: catalogSelect }));
    case "assistanceType":
      return toRecord(await db.assistanceType.create({ data, select: catalogSelect }));
    case "requirement":
      return toRecord(
        await db.complianceRequirement.create({
          data: { ...data, frequency: input.frequency ?? null },
          select: requirementSelect,
        }),
      );
    case "documentType":
      return toRecord(await db.documentType.create({ data, select: catalogSelect }));
  }
}

async function updateCatalogRow(
  db: Prisma.TransactionClient,
  kind: CatalogKind,
  id: string,
  input: UpdateCatalogAdminItemInput,
): Promise<CatalogAdminRecord> {
  const data = writeData(input);
  switch (kind) {
    case "sector":
      return toRecord(await db.cooperativeSector.update({ where: { id }, data, select: catalogSelect }));
    case "type":
      return toRecord(await db.cooperativeType.update({ where: { id }, data, select: catalogSelect }));
    case "status":
      return toRecord(await db.cooperativeStatus.update({ where: { id }, data, select: catalogSelect }));
    case "barangay":
      return toRecord(await db.barangay.update({ where: { id }, data, select: catalogSelect }));
    case "program":
      return toRecord(await db.program.update({ where: { id }, data, select: catalogSelect }));
    case "assistanceType":
      return toRecord(await db.assistanceType.update({ where: { id }, data, select: catalogSelect }));
    case "requirement":
      return toRecord(
        await db.complianceRequirement.update({
          where: { id },
          data: { ...data, frequency: input.frequency ?? null },
          select: requirementSelect,
        }),
      );
    case "documentType":
      return toRecord(await db.documentType.update({ where: { id }, data, select: catalogSelect }));
  }
}

export async function listCatalogAdminItems(kind: CatalogKind): Promise<CatalogAdminRecord[]> {
  switch (kind) {
    case "sector":
      return (await prisma.cooperativeSector.findMany({ select: catalogSelect, orderBy: listOrder })).map(
        toRecord,
      );
    case "type":
      return (await prisma.cooperativeType.findMany({ select: catalogSelect, orderBy: listOrder })).map(
        toRecord,
      );
    case "status":
      return (await prisma.cooperativeStatus.findMany({ select: catalogSelect, orderBy: listOrder })).map(
        toRecord,
      );
    case "barangay":
      return (await prisma.barangay.findMany({ select: catalogSelect, orderBy: listOrder })).map(toRecord);
    case "program":
      return (await prisma.program.findMany({ select: catalogSelect, orderBy: listOrder })).map(toRecord);
    case "assistanceType":
      return (await prisma.assistanceType.findMany({ select: catalogSelect, orderBy: listOrder })).map(
        toRecord,
      );
    case "requirement":
      return (
        await prisma.complianceRequirement.findMany({ select: requirementSelect, orderBy: listOrder })
      ).map(toRecord);
    case "documentType":
      return (await prisma.documentType.findMany({ select: catalogSelect, orderBy: listOrder })).map(
        toRecord,
      );
  }
}

export async function getCatalogAdminItem(
  kind: CatalogKind,
  id: string,
): Promise<CatalogAdminRecord | null> {
  return findCatalogItem(prisma, kind, id);
}

export async function createCatalogAdminItem(options: {
  actorId: string;
  input: CreateCatalogAdminItemInput;
}): Promise<CatalogAdminRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await createCatalogRow(tx, options.input.kind, options.input);
      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "CATALOG_CREATE",
          entityType: CATALOG_KIND_META[options.input.kind].entityType,
          entityId: created.id,
          source: "WEB",
          metadata: { kind: options.input.kind, after: snapshot(created) },
        },
        tx,
      );
      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new CatalogAdminConflictError();
    }
    throw error;
  }
}

export async function updateCatalogAdminItem(options: {
  actorId: string;
  input: UpdateCatalogAdminItemInput;
}): Promise<CatalogAdminRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await findCatalogItem(tx, options.input.kind, options.input.id);
      if (!existing) {
        throw new CatalogAdminNotFoundError();
      }
      const updated = await updateCatalogRow(tx, options.input.kind, existing.id, options.input);
      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "CATALOG_UPDATE",
          entityType: CATALOG_KIND_META[options.input.kind].entityType,
          entityId: updated.id,
          source: "WEB",
          metadata: {
            kind: options.input.kind,
            before: snapshot(existing),
            after: snapshot(updated),
          },
        },
        tx,
      );
      return updated;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new CatalogAdminConflictError();
    }
    throw error;
  }
}
