import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import { requireActiveDocumentType } from "@/lib/dal/document-types";
import { prisma } from "@/lib/dal/prisma";
import { DOCUMENT_VERIFICATION_STATUS } from "@/lib/documents/verification-status";
import type { ListDocumentsInput, VerifyDocumentInput } from "@/lib/validation/document";

export class CooperativeDocumentNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Document not found");
    this.name = "CooperativeDocumentNotFoundError";
  }
}

export class DocumentScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Document does not belong to this cooperative");
    this.name = "DocumentScopeError";
  }
}

export class DocumentVerifyError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Document cannot be verified from its current state");
    this.name = "DocumentVerifyError";
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
  verificationStatus: true,
  uploadedAt: true,
  uploadedById: true,
  verifiedAt: true,
  verifiedById: true,
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
  verifiedBy: {
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
    verificationStatus: row.verificationStatus,
    verifiedById: row.verifiedById,
    verifiedAt: row.verifiedAt,
  };
}

async function loadScopedDocument(
  tx: Prisma.TransactionClient,
  input: { id: string; cooperativeId: string },
): Promise<CooperativeDocumentRecord> {
  const existing = await tx.cooperativeDocument.findUnique({
    where: { id: input.id },
    select: listSelect,
  });
  if (!existing) {
    throw new CooperativeDocumentNotFoundError();
  }
  if (existing.cooperativeId !== input.cooperativeId) {
    throw new DocumentScopeError();
  }
  return existing;
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
        verificationStatus: DOCUMENT_VERIFICATION_STATUS.UNVERIFIED,
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

export async function verifyCooperativeDocument(options: {
  input: VerifyDocumentInput;
  actorId: string;
}): Promise<CooperativeDocumentRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await loadScopedDocument(tx, options.input);
    if (
      existing.verificationStatus === DOCUMENT_VERIFICATION_STATUS.VERIFIED ||
      existing.verifiedById
    ) {
      throw new DocumentVerifyError();
    }

    const verifiedAt = new Date();
    const updated = await tx.cooperativeDocument.update({
      where: { id: existing.id },
      data: {
        verificationStatus: DOCUMENT_VERIFICATION_STATUS.VERIFIED,
        verifiedById: options.actorId,
        verifiedAt,
      },
      select: listSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "DOCUMENT_VERIFY",
        entityType: "CooperativeDocument",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: documentSnapshot(existing),
          after: documentSnapshot(updated),
        },
      },
      tx,
    );

    return updated;
  });
}
