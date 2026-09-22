import { describe, expect, it } from "vitest";

import {
  createComplianceRecordSchema,
  verifyComplianceRecordSchema,
} from "@/lib/validation/compliance-record";

describe("compliance record schemas", () => {
  it("accepts a create payload and omits extra verifier fields", () => {
    const parsed = createComplianceRecordSchema.parse({
      cooperativeId: "coop-1",
      requirementId: "req-1",
      reportingPeriod: "2026-Q1",
      dueDate: "2026-03-31",
      submittedDate: "",
      remarks: "  ",
      verifiedById: "spoof-user",
      extraField: "must-not-assign",
    });

    expect(parsed.reportingPeriod).toBe("2026-Q1");
    expect(parsed.submittedDate).toBeNull();
    expect(parsed.remarks).toBeNull();
    expect(parsed).not.toHaveProperty("verifiedById");
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects client-supplied verifier fields on verify", () => {
    const parsed = verifyComplianceRecordSchema.parse({
      id: "record-1",
      cooperativeId: "coop-1",
      verifiedById: "spoof-user",
      verifiedAt: "2020-01-01",
    });

    expect(parsed).toEqual({ id: "record-1", cooperativeId: "coop-1" });
    expect(parsed).not.toHaveProperty("verifiedById");
    expect(parsed).not.toHaveProperty("verifiedAt");
  });
});
