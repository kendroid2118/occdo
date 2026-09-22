import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { CooperativeNotFoundError, createCooperative } from "@/lib/dal/cooperatives";
import { DocumentTypeInactiveError } from "@/lib/dal/document-types";
import {
  createCooperativeDocument,
  getCooperativeDocumentById,
  getCooperativeDocumentForDownload,
  listCooperativeDocuments,
} from "@/lib/dal/documents";
import { generateStoredFilename } from "@/lib/documents/filename";
import { prisma } from "@/lib/dal/prisma";
import {
  readDocumentFile,
  unlinkDocumentFile,
  writeDocumentFile,
} from "@/lib/storage/documents";

const prefix = "occdo-033";
const actorEmail = `${prefix}-actor@example.invalid`;
const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.4\nfixture\n"));

describe("cooperative document DAL", () => {
  let actorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let activeTypeId = "";
  let inactiveTypeId = "";
  let documentId = "";
  let storedFilename = "";
  let storageRoot = "";

  beforeAll(async () => {
    storageRoot = await mkdtemp(path.join(os.tmpdir(), "occdo-033-"));
    await seedCooperativeReferenceData(prisma);
    await prisma.cooperativeDocument.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({
      where: { email: actorEmail },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.documentType.deleteMany({
      where: { code: { in: [`${prefix}-ACTIVE`, `${prefix}-INACTIVE`] } },
    });

    const [actor, coopType, sector, barangay, coopStatus, accreditation] = await Promise.all([
      prisma.user.create({
        data: {
          email: actorEmail,
          name: "OCCDO-033 Actor",
          role: Role.ADMIN,
          isActive: true,
          passwordHash: "placeholder-hash-not-a-password",
        },
        select: { id: true },
      }),
      prisma.cooperativeType.create({
        data: { code: `${prefix}-CT`, name: "Type", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.cooperativeSector.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
      prisma.barangay.findFirst({
        where: { isActive: true },
        select: { id: true },
      }),
      prisma.cooperativeStatus.create({
        data: { code: `${prefix}-CS`, name: "Status", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.accreditationStatus.create({
        data: { code: `${prefix}-ACC`, name: "Accreditation", sortOrder: 1 },
        select: { id: true },
      }),
    ]);

    if (!sector || !barangay) {
      throw new Error("OCCDO-016 seed sectors/barangays are required");
    }

    actorId = actor.id;

    const [activeType, inactiveType] = await Promise.all([
      prisma.documentType.create({
        data: { code: `${prefix}-ACTIVE`, name: "Active document type", sortOrder: 1 },
        select: { id: true },
      }),
      prisma.documentType.create({
        data: {
          code: `${prefix}-INACTIVE`,
          name: "Inactive document type",
          sortOrder: 2,
          isActive: false,
        },
        select: { id: true },
      }),
    ]);
    activeTypeId = activeType.id;
    inactiveTypeId = inactiveType.id;

    const coopInput = {
      registrationNumber: null,
      acronym: null,
      typeId: coopType.id,
      sectorId: sector.id,
      address: "Ormoc",
      barangayId: barangay.id,
      contactPerson: "Staff",
      contactNumber: "09170000000",
      email: null,
      dateRegistered: null,
      dateAccredited: null,
      accreditationStatusId: accreditation.id,
      statusId: coopStatus.id,
      totalMembers: 0,
      maleMembers: 0,
      femaleMembers: 0,
      remarks: null,
    };

    const [coopA, coopB] = await Promise.all([
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Document Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Document Coop B" },
      }),
    ]);
    cooperativeAId = coopA.id;
    cooperativeBId = coopB.id;

    storedFilename = generateStoredFilename("pdf");
    await writeDocumentFile(storedFilename, pdfBytes, storageRoot);
    const created = await createCooperativeDocument({
      actorId,
      input: {
        cooperativeId: cooperativeAId,
        documentTypeId: activeTypeId,
        reportingPeriod: "2026",
        originalFilename: "report.pdf",
        storedFilename,
        mimeType: "application/pdf",
        sizeBytes: pdfBytes.byteLength,
      },
    });
    documentId = created.id;
  });

  afterAll(async () => {
    await prisma.cooperativeDocument.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.documentType.deleteMany({
      where: { code: { in: [`${prefix}-ACTIVE`, `${prefix}-INACTIVE`] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({
      where: { email: actorEmail },
    });
    if (storageRoot) {
      await rm(storageRoot, { recursive: true, force: true });
    }
    await prisma.$disconnect();
  });

  it("rejects a forged cooperative id", async () => {
    await expect(
      createCooperativeDocument({
        actorId,
        input: {
          cooperativeId: "missing-cooperative-id",
          documentTypeId: activeTypeId,
          reportingPeriod: null,
          originalFilename: "report.pdf",
          storedFilename: generateStoredFilename("pdf"),
          mimeType: "application/pdf",
          sizeBytes: pdfBytes.byteLength,
        },
      }),
    ).rejects.toBeInstanceOf(CooperativeNotFoundError);
  });

  it("rejects inactive document types on new uploads", async () => {
    await expect(
      createCooperativeDocument({
        actorId,
        input: {
          cooperativeId: cooperativeAId,
          documentTypeId: inactiveTypeId,
          reportingPeriod: null,
          originalFilename: "report.pdf",
          storedFilename: generateStoredFilename("pdf"),
          mimeType: "application/pdf",
          sizeBytes: pdfBytes.byteLength,
        },
      }),
    ).rejects.toBeInstanceOf(DocumentTypeInactiveError);
  });

  it("stores metadata without exposing the stored filename on list/get", async () => {
    const listed = await listCooperativeDocuments({
      page: 1,
      pageSize: 20,
      cooperativeId: cooperativeAId,
    });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.id).toBe(documentId);
    expect(listed.items[0]?.cooperative.id).toBe(cooperativeAId);
    expect(listed.items[0]?.cooperative.id).not.toBe(cooperativeBId);
    expect(listed.items[0]).not.toHaveProperty("storedFilename");
    expect(JSON.stringify(listed.items)).not.toContain(storedFilename);
    expect(JSON.stringify(listed.items)).not.toContain("09170000000");

    const loaded = await getCooperativeDocumentById(documentId);
    expect(loaded?.originalFilename).toBe("report.pdf");
    expect(loaded).not.toHaveProperty("storedFilename");

    const download = await getCooperativeDocumentForDownload(documentId);
    expect(download?.storedFilename).toBe(storedFilename);
    const bytes = await readDocumentFile(storedFilename, storageRoot);
    expect(Buffer.from(bytes).equals(Buffer.from(pdfBytes))).toBe(true);

    const audit = await prisma.auditLog.findFirst({
      where: { actorId, action: "DOCUMENT_UPLOAD", entityId: documentId },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("CooperativeDocument");
    expect(JSON.stringify(audit?.metadata)).toContain("report.pdf");
    expect(JSON.stringify(audit?.metadata)).not.toContain(storedFilename);
    expect(JSON.stringify(audit?.metadata)).not.toContain("%PDF");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });

  it("does not write bytes outside the storage jail", async () => {
    await expect(writeDocumentFile("../escape.pdf", pdfBytes, storageRoot)).rejects.toThrow();
    await expect(unlinkDocumentFile("../escape.pdf", storageRoot)).rejects.toThrow();
  });
});
