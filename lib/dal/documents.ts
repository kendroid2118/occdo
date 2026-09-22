import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import { requireActiveDocumentType } from "@/lib/dal/document-types";
import { prisma } from "@/lib/dal/prisma";
import type { ListDocumentsInput } from "@/lib/validation/document";

export class CooperativeDocumentNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Document not found");
    this.name = "CooperativeDocumentNotFoundError";
  }
}

const listSelect = {
  id: true,
  cooperativeId: true,
  documentTypeId: true,
  reportingPeriod: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
  uploadedAt: true,
  uploadedById: true,
  documentType: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
  uploadedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const downloadSelect = {
  id: true,
  storedFilename: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
} as const;

export type CooperativeDocumentRecord = Prisma.CooperativeDocumentGetPayload<{
  select: typeof listSelect;
}>;

export type CooperativeDocumentDownloadRecord = Prisma.CooperativeDocumentGetPayload<{
  select: typeof downloadSelect;
}>;

export type CooperativeDocumentListResult = {
  items: CooperativeDocumentRecord[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateCooperativeDocumentInput = {
  cooperativeId: string;
  documentTypeId: string;
  reportingPeriod: string | null;
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  sizeBytes: number;
};

function documentSnapshot(row: CooperativeDocumentRecord) {
  return {
    cooperativeId: row.cooperativeId,
    documentTypeId: row.documentTypeId,
    reportingPeriod: row.reportingPeriod,
    originalFilename: row.originalFilename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
  };
}

function listWhere(input: ListDocumentsInput): Prisma.CooperativeDocumentWhereInput {
  const where: Prisma.CooperativeDocumentWhereInput = {};
  if (input.cooperativeId) {
    where.cooperativeId = input.cooperativeId;
  }
  if (input.documentTypeId) {
    where.documentTypeId = input.documentTypeId;
  }
  return where;
}

export async function listCooperativeDocuments(
  input: ListDocumentsInput,
): Promise<CooperativeDocumentListResult> {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;

  const [total, items] = await prisma.$transaction([
    prisma.cooperativeDocument.count({ where }),
    prisma.cooperativeDocument.findMany({
      where,
      select: listSelect,
      orderBy: [{ uploadedAt: "desc" }, { id: "desc" }],
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

export async function getCooperativeDocumentById(
  id: string,
): Promise<CooperativeDocumentRecord | null> {
  return prisma.cooperativeDocument.findUnique({
    where: { id },
    select: listSelect,
  });
}

export async function getCooperativeDocumentForDownload(
  id: string,
): Promise<CooperativeDocumentDownloadRecord | null> {
  return prisma.cooperativeDocument.findUnique({
    where: { id },
    select: downloadSelect,
  });
}

export async function createCooperativeDocument(options: {
  input: CreateCooperativeDocumentInput;
  actorId: string;
}): Promise<CooperativeDocumentRecord> {
  return prisma.$transaction(async (tx) => {
    const [cooperative] = await Promise.all([
      tx.cooperative.findUnique({
        where: { id: options.input.cooperativeId },
        select: { id: true },
      }),
      requireActiveDocumentType(options.input.documentTypeId, tx),
    ]);

    if (!cooperative) {
      throw new CooperativeNotFoundError();
    }

    const created = await tx.cooperativeDocument.create({
      data: {
        cooperativeId: cooperative.id,
        documentTypeId: options.input.documentTypeId,
        reportingPeriod: options.input.reportingPeriod,
        originalFilename: options.input.originalFilename,
        storedFilename: options.input.storedFilename,
        mimeType: options.input.mimeType,
        sizeBytes: options.input.sizeBytes,
        uploadedById: options.actorId,
      },
      select: listSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "DOCUMENT_UPLOAD",
        entityType: "CooperativeDocument",
        entityId: created.id,
        source: "WEB",
        metadata: { after: documentSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}
