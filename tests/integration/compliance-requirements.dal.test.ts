import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { SEED_COMPLIANCE_REQUIREMENTS } from "../../db/reference-data";
import { seedCooperativeReferenceData } from "../../db/seed-reference";
import {
  ComplianceRequirementInactiveError,
  getComplianceRequirementById,
  listActiveComplianceRequirements,
  requireActiveComplianceRequirement,
} from "@/lib/dal/compliance-requirements";
import { prisma } from "@/lib/dal/prisma";

const inactiveCode = "ZZ-OCCDO-031-INACTIVE";

describe("compliance requirement DAL list-active", () => {
  let inactiveId = "";

  beforeAll(async () => {
    await seedCooperativeReferenceData(prisma);
    await prisma.complianceRequirement.deleteMany({
      where: { code: inactiveCode },
    });
    const inactive = await prisma.complianceRequirement.create({
      data: {
        code: inactiveCode,
        name: "OCCDO-031 inactive requirement",
        frequency: "ANNUAL",
        sortOrder: 999,
        isActive: false,
      },
      select: { id: true },
    });
    inactiveId = inactive.id;
  });

  afterAll(async () => {
    await prisma.complianceRequirement.deleteMany({
      where: { code: inactiveCode },
    });
    await prisma.$disconnect();
  });

  it("lists seeded demo requirements and excludes inactive rows", async () => {
    const listed = await listActiveComplianceRequirements();
    const codes = listed.map((row) => row.code);

    expect(
      SEED_COMPLIANCE_REQUIREMENTS.every((row) => codes.includes(row.code)),
    ).toBe(true);
    expect(codes).not.toContain(inactiveCode);
    expect(listed.every((row) => row.isActive)).toBe(true);
  });

  it("preserves inactive requirements historically but blocks them for new records", async () => {
    const historical = await getComplianceRequirementById(inactiveId);
    expect(historical?.code).toBe(inactiveCode);
    expect(historical?.isActive).toBe(false);

    await expect(requireActiveComplianceRequirement(inactiveId)).rejects.toBeInstanceOf(
      ComplianceRequirementInactiveError,
    );
  });
});
