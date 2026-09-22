import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type { ReferenceRecord } from "@/lib/dal/reference";
import type { CreateCatalogItemInput } from "@/lib/validation/program";

export class CatalogConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Catalog code is already in use");
    this.name = "CatalogConflictError";
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

export async function createProgram(options: {
  input: CreateCatalogItemInput;
  actorId: string;
}): Promise<ReferenceRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.program.create({
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
          action: "PROGRAM_CREATE",
          entityType: "Program",
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
      throw new CatalogConflictError();
    }
    throw error;
  }
}

export async function createServiceType(options: {
  input: CreateCatalogItemInput;
  actorId: string;
}): Promise<ReferenceRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.serviceType.create({
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
          action: "SERVICE_TYPE_CREATE",
          entityType: "ServiceType",
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
      throw new CatalogConflictError();
    }
    throw error;
  }
}
