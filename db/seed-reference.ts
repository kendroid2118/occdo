import type { PrismaClient } from "@prisma/client";

import {
  SEED_ACCREDITATION_CASE_STATUSES,
  SEED_ACCREDITATION_CASE_TYPES,
  SEED_ACCREDITATION_STATUSES,
  SEED_COOPERATIVE_SECTORS,
  SEED_COOPERATIVE_STATUSES,
  SEED_COOPERATIVE_TYPES,
  SEED_OFFICER_POSITIONS,
  SEED_ORMOC_BARANGAYS,
  SEED_ASSISTANCE_STATUSES,
  SEED_ASSISTANCE_TYPES,
  SEED_COMPLIANCE_REQUIREMENTS,
  SEED_COMPLIANCE_STATUSES,
  SEED_DOCUMENT_TEMPLATES,
  SEED_DOCUMENT_TYPES,
  SEED_PROGRAMS,
  SEED_SERVICE_TYPES,
  type ReferenceSeedRow,
} from "./reference-data";

async function upsertRows<T extends ReferenceSeedRow>(
  rows: readonly T[],
  upsert: (row: T) => Promise<unknown>,
): Promise<void> {
  for (const row of rows) {
    await upsert(row);
  }
}

/** Upserts maintainable catalogs. Does not change isActive on existing rows. */
export async function seedCooperativeReferenceData(
  prisma: PrismaClient,
): Promise<void> {
  await upsertRows(SEED_COOPERATIVE_TYPES, (row) =>
    prisma.cooperativeType.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_COOPERATIVE_STATUSES, (row) =>
    prisma.cooperativeStatus.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ACCREDITATION_STATUSES, (row) =>
    prisma.accreditationStatus.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_COOPERATIVE_SECTORS, (row) =>
    prisma.cooperativeSector.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_OFFICER_POSITIONS, (row) =>
    prisma.officerPosition.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ACCREDITATION_CASE_TYPES, (row) =>
    prisma.accreditationCaseType.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ACCREDITATION_CASE_STATUSES, (row) =>
    prisma.accreditationCaseStatus.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_PROGRAMS, (row) =>
    prisma.program.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_SERVICE_TYPES, (row) =>
    prisma.serviceType.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ASSISTANCE_TYPES, (row) =>
    prisma.assistanceType.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ASSISTANCE_STATUSES, (row) =>
    prisma.assistanceStatus.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_COMPLIANCE_REQUIREMENTS, (row) =>
    prisma.complianceRequirement.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
        frequency: row.frequency,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
        frequency: row.frequency,
      },
    }),
  );

  await upsertRows(SEED_COMPLIANCE_STATUSES, (row) =>
    prisma.complianceStatus.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_DOCUMENT_TYPES, (row) =>
    prisma.documentType.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_DOCUMENT_TEMPLATES, (row) =>
    prisma.documentTemplate.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );

  await upsertRows(SEED_ORMOC_BARANGAYS, (row) =>
    prisma.barangay.upsert({
      where: { code: row.code },
      create: {
        code: row.code,
        name: row.name,
        sortOrder: row.sortOrder,
      },
      update: {
        name: row.name,
        sortOrder: row.sortOrder,
      },
    }),
  );
}
