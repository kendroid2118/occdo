import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type { ReferenceRecord } from "@/lib/dal/reference";
import type { CreateCatalogItemInput } from "@/lib/validation/program";

export class DocumentTypeConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Catalog code is already in use");
    this.name = "DocumentTypeConflictError";
  }
}

export class DocumentTypeNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Document type not found");
    this.name = "DocumentTypeNotFoundError";
  }
}

export class DocumentTypeInactiveError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Inactive document types cannot be used for new uploads");
    this.name = "DocumentTypeInactiveError";
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

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function catalogSnapshot(row: ReferenceRecord) {
  return {
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

export async function listActiveDocumentTypes(): Promise<ReferenceRecord[]> {
  return prisma.documentType.findMany({
    where: { isActive: true },
    select: catalogSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function requireActiveDocumentType(
  id: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<ReferenceRecord> {
  const row = await db.documentType.findUnique({
    where: { id },
    select: catalogSelect,
  });
  if (!row) {
    throw new DocumentTypeNotFoundError();
  }
  if (!row.isActive) {
    throw new DocumentTypeInactiveError();
  }
  return row;
}

export async function createDocumentType(options: {
  input: CreateCatalogItemInput;
  actorId: string;
}): Promise<ReferenceRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.documentType.create({
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
          action: "DOCUMENT_TYPE_CREATE",
          entityType: "DocumentType",
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
      throw new DocumentTypeConflictError();
    }
    throw error;
  }
}
