import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import { createCooperative } from "@/lib/dal/cooperatives";
import {
  DocumentScopeError,
  DocumentVerifyError,
  createCooperativeDocument,
  getCooperativeDocumentById,
  getCooperativeDocumentForDownload,
  verifyCooperativeDocument,
} from "@/lib/dal/documents";
import { listActiveDocumentTemplates } from "@/lib/dal/document-templates";
import { generateStoredFilename } from "@/lib/documents/filename";
import { DOCUMENT_VERIFICATION_STATUS } from "@/lib/documents/verification-status";
import { prisma } from "@/lib/dal/prisma";
import { readDocumentFile, writeDocumentFile } from "@/lib/storage/documents";

const prefix = "occdo-034";
const actorEmail = `${prefix}-actor@example.invalid`;
const otherEmail = `${prefix}-other@example.invalid`;
const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.4\nverify-fixture\n"));

describe("document verification DAL", () => {
  let actorId = "";
  let otherActorId = "";
  let cooperativeAId = "";
  let cooperativeBId = "";
  let documentTypeId = "";
  let documentId = "";
  let storedFilename = "";
  let storageRoot = "";

  beforeAll(async () => {
    storageRoot = await mkdtemp(path.join(os.tmpdir(), "occdo-034-"));
    await seedCooperativeReferenceData(prisma);
    await prisma.cooperativeDocument.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [actorEmail, otherEmail] } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.documentType.deleteMany({ where: { code: `${prefix}-TYPE` } });

    const [actor, otherActor, coopType, sector, barangay, coopStatus, accreditation] =
      await Promise.all([
        prisma.user.create({
          data: {
            email: actorEmail,
            name: "OCCDO-034 Actor",
            role: Role.ADMIN,
            isActive: true,
            passwordHash: "placeholder-hash-not-a-password",
          },
          select: { id: true },
        }),
        prisma.user.create({
          data: {
            email: otherEmail,
            name: "OCCDO-034 Other",
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
    otherActorId = otherActor.id;

    const documentType = await prisma.documentType.create({
      data: { code: `${prefix}-TYPE`, name: "Verify type", sortOrder: 1 },
      select: { id: true },
    });
    documentTypeId = documentType.id;

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
        input: { ...coopInput, cooperativeCode: `${prefix}-A`, name: "Verify Coop A" },
      }),
      createCooperative({
        actorId,
        input: { ...coopInput, cooperativeCode: `${prefix}-B`, name: "Verify Coop B" },
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
        documentTypeId,
        reportingPeriod: "2026",
        originalFilename: "report.pdf",
        storedFilename,
        mimeType: "application/pdf",
        sizeBytes: pdfBytes.byteLength,
      },
    });
    documentId = created.id;
    expect(created.verificationStatus).toBe(DOCUMENT_VERIFICATION_STATUS.UNVERIFIED);
  });

  afterAll(async () => {
    await prisma.cooperativeDocument.deleteMany({
      where: { cooperative: { cooperativeCode: { startsWith: `${prefix}-` } } },
    });
    await prisma.auditLog.deleteMany({
      where: { actorId: { in: [actorId, otherActorId] } },
    });
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.documentType.deleteMany({ where: { code: `${prefix}-TYPE` } });
    await prisma.cooperativeType.deleteMany({ where: { code: `${prefix}-CT` } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: `${prefix}-CS` } });
    await prisma.accreditationStatus.deleteMany({ where: { code: `${prefix}-ACC` } });
    await prisma.user.deleteMany({
      where: { email: { in: [actorEmail, otherEmail] } },
    });
    if (storageRoot) {
      await rm(storageRoot, { recursive: true, force: true });
    }
    await prisma.$disconnect();
  });

  it("rejects cross-cooperative retargeting", async () => {
    await expect(
      verifyCooperativeDocument({
        actorId,
        input: { id: documentId, cooperativeId: cooperativeBId },
      }),
    ).rejects.toBeInstanceOf(DocumentScopeError);
  });

  it("sets verifier from the session actor and leaves stored bytes unchanged", async () => {
    const beforeDownload = await getCooperativeDocumentForDownload(documentId);
    expect(beforeDownload?.storedFilename).toBe(storedFilename);
    expect(beforeDownload?.sizeBytes).toBe(pdfBytes.byteLength);

    const verified = await verifyCooperativeDocument({
      actorId,
      input: { id: documentId, cooperativeId: cooperativeAId },
    });

    expect(verified.verifiedById).toBe(actorId);
    expect(verified.verifiedById).not.toBe(otherActorId);
    expect(verified.verificationStatus).toBe(DOCUMENT_VERIFICATION_STATUS.VERIFIED);
    expect(verified.verifiedAt).toBeTruthy();
    expect(verified.originalFilename).toBe("report.pdf");
    expect(verified).not.toHaveProperty("storedFilename");

    const afterDownload = await getCooperativeDocumentForDownload(documentId);
    expect(afterDownload?.storedFilename).toBe(storedFilename);
    expect(afterDownload?.originalFilename).toBe("report.pdf");
    expect(afterDownload?.mimeType).toBe("application/pdf");
    expect(afterDownload?.sizeBytes).toBe(pdfBytes.byteLength);
    const bytes = await readDocumentFile(storedFilename, storageRoot);
    expect(Buffer.from(bytes).equals(Buffer.from(pdfBytes))).toBe(true);

    const loaded = await getCooperativeDocumentById(documentId);
    expect(loaded?.verifiedBy?.name).toBe("OCCDO-034 Actor");

    const audit = await prisma.auditLog.findFirst({
      where: { actorId, action: "DOCUMENT_VERIFY", entityId: documentId },
      select: { entityType: true, metadata: true },
    });
    expect(audit?.entityType).toBe("CooperativeDocument");
    expect(JSON.stringify(audit?.metadata)).toContain(actorId);
    expect(JSON.stringify(audit?.metadata)).not.toContain(storedFilename);
    expect(JSON.stringify(audit?.metadata)).not.toContain("%PDF");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });

  it("rejects repeat verification", async () => {
    await expect(
      verifyCooperativeDocument({
        actorId: otherActorId,
        input: { id: documentId, cooperativeId: cooperativeAId },
      }),
    ).rejects.toBeInstanceOf(DocumentVerifyError);
  });

  it("lists office templates without file storage fields", async () => {
    const templates = await listActiveDocumentTemplates();
    expect(templates.some((row) => row.code.startsWith("DEMO-"))).toBe(true);
    expect(templates.every((row) => !("storedFilename" in row))).toBe(true);
  });
});
