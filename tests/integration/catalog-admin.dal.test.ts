import { Role } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  CatalogAdminNotFoundError,
  createCatalogAdminItem,
  updateCatalogAdminItem,
} from "@/lib/dal/catalog-admin";
import { createCooperative, getCooperativeById } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { upsertCdaPortalUrl } from "@/lib/dal/system-config";

const prefix = "occdo-042";
const actorEmail = `${prefix}-actor@example.invalid`;

describe("catalog admin DAL", () => {
  let actorId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.cooperativeType.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.cooperativeSector.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.accreditationStatus.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.systemConfig.deleteMany({ where: { key: "cdaPortalUrl" } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });

    const actor = await prisma.user.create({
      data: {
        email: actorEmail,
        name: "OCCDO-042 Actor",
        role: Role.SUPER_ADMIN,
        isActive: true,
        passwordHash: "placeholder-hash-not-a-password",
      },
      select: { id: true },
    });
    actorId = actor.id;
  });

  afterAll(async () => {
    await prisma.cooperative.deleteMany({
      where: { cooperativeCode: { startsWith: `${prefix}-` } },
    });
    await prisma.auditLog.deleteMany({ where: { actorId } });
    await prisma.cooperativeType.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.cooperativeSector.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.cooperativeStatus.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.accreditationStatus.deleteMany({ where: { code: { startsWith: `${prefix}-` } } });
    await prisma.systemConfig.deleteMany({
      where: { key: "cdaPortalUrl", updatedById: actorId },
    });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("creates a sector, deactivates a referenced type, and keeps the historical name", async () => {
    const sector = await createCatalogAdminItem({
      actorId,
      input: {
        kind: "sector",
        code: `${prefix}-SEC`,
        name: "042 Sector",
        description: null,
        sortOrder: 90,
        isActive: true,
        frequency: null,
      },
    });
    expect(sector.name).toBe("042 Sector");

    const type = await createCatalogAdminItem({
      actorId,
      input: {
        kind: "type",
        code: `${prefix}-TYP`,
        name: "042 Historical Type",
        description: null,
        sortOrder: 90,
        isActive: true,
        frequency: null,
      },
    });
    const status = await createCatalogAdminItem({
      actorId,
      input: {
        kind: "status",
        code: `${prefix}-ST`,
        name: "042 Status",
        description: null,
        sortOrder: 90,
        isActive: true,
        frequency: null,
      },
    });
    const accreditation = await prisma.accreditationStatus.create({
      data: { code: `${prefix}-ACC`, name: "042 Acc", sortOrder: 90 },
      select: { id: true },
    });
    const barangay = await prisma.barangay.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!barangay) {
      throw new Error("seed barangays are required");
    }

    const coop = await createCooperative({
      actorId,
      input: {
        cooperativeCode: `${prefix}-A`,
        name: "042 Coop",
        registrationNumber: null,
        acronym: null,
        typeId: type.id,
        sectorId: sector.id,
        address: "Ormoc",
        barangayId: barangay.id,
        contactPerson: "Staff",
        contactNumber: "09170000000",
        email: null,
        dateRegistered: null,
        dateAccredited: null,
        accreditationStatusId: accreditation.id,
        statusId: status.id,
        totalMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        remarks: null,
      },
    });

    const deactivated = await updateCatalogAdminItem({
      actorId,
      input: {
        kind: "type",
        id: type.id,
        code: type.code,
        name: type.name,
        description: null,
        sortOrder: 90,
        isActive: false,
        frequency: null,
      },
    });
    expect(deactivated.isActive).toBe(false);

    const loaded = await getCooperativeById(coop.id);
    expect(loaded?.type.name).toBe("042 Historical Type");

    await expect(
      updateCatalogAdminItem({
        actorId,
        input: {
          kind: "type",
          id: "missing-type",
          code: "NO",
          name: "No",
          description: null,
          sortOrder: 0,
          isActive: false,
          frequency: null,
        },
      }),
    ).rejects.toBeInstanceOf(CatalogAdminNotFoundError);

    const audit = await prisma.auditLog.findFirst({
      where: { entityId: type.id, action: "CATALOG_UPDATE" },
      select: { metadata: true },
    });
    expect(JSON.stringify(audit?.metadata)).toContain("042 Historical Type");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
  });

  it("stores a non-secret CDA Portal URL", async () => {
    const saved = await upsertCdaPortalUrl({
      actorId,
      value: "https://cda.gov.ph/portal",
    });
    expect(saved?.value).toBe("https://cda.gov.ph/portal");

    const audit = await prisma.auditLog.findFirst({
      where: { entityId: "cdaPortalUrl", action: "SYSTEM_CONFIG_UPDATE" },
      select: { metadata: true },
    });
    expect(JSON.stringify(audit?.metadata)).toContain("https://cda.gov.ph/portal");
    expect(JSON.stringify(audit?.metadata)).not.toContain("passwordHash");
    expect(JSON.stringify(audit?.metadata)).not.toContain("AUTH_SECRET");
  });
});
