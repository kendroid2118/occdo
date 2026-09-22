import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type { CreateComplianceRequirementInput } from "@/lib/validation/compliance-requirement";

export class ComplianceRequirementConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("Catalog code is already in use");
    this.name = "ComplianceRequirementConflictError";
  }
}

export class ComplianceRequirementNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Compliance requirement not found");
    this.name = "ComplianceRequirementNotFoundError";
  }
}

export class ComplianceRequirementInactiveError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Inactive compliance requirements cannot be used on new records");
    this.name = "ComplianceRequirementInactiveError";
  }
}

const requirementSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  frequency: true,
  sortOrder: true,
  isActive: true,
} as const;

export type ComplianceRequirementRecord = Prisma.ComplianceRequirementGetPayload<{
  select: typeof requirementSelect;
}>;

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function requirementSnapshot(row: ComplianceRequirementRecord) {
  return {
    code: row.code,
    name: row.name,
    frequency: row.frequency,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

export async function listActiveComplianceRequirements(): Promise<
  ComplianceRequirementRecord[]
> {
  return prisma.complianceRequirement.findMany({
    where: { isActive: true },
    select: requirementSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getComplianceRequirementById(
  id: string,
): Promise<ComplianceRequirementRecord | null> {
  return prisma.complianceRequirement.findUnique({
    where: { id },
    select: requirementSelect,
  });
}

export async function requireActiveComplianceRequirement(
  id: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<ComplianceRequirementRecord> {
  const row = await db.complianceRequirement.findUnique({
    where: { id },
    select: requirementSelect,
  });
  if (!row) {
    throw new ComplianceRequirementNotFoundError();
  }
  if (!row.isActive) {
    throw new ComplianceRequirementInactiveError();
  }
  return row;
}

export async function createComplianceRequirement(options: {
  input: CreateComplianceRequirementInput;
  actorId: string;
}): Promise<ComplianceRequirementRecord> {
  try {
    return await prisma.$transaction(async (tx) => {
      const created = await tx.complianceRequirement.create({
        data: {
          code: options.input.code,
          name: options.input.name,
          description: options.input.description,
          frequency: options.input.frequency,
          sortOrder: options.input.sortOrder,
        },
        select: requirementSelect,
      });

      await writeAuditLog(
        {
          actorId: options.actorId,
          action: "COMPLIANCE_REQUIREMENT_CREATE",
          entityType: "ComplianceRequirement",
          entityId: created.id,
          source: "WEB",
          metadata: { after: requirementSnapshot(created) },
        },
        tx,
      );

      return created;
    });
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new ComplianceRequirementConflictError();
    }
    throw error;
  }
}
