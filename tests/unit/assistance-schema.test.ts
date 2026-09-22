import { describe, expect, it } from "vitest";

import { assistanceAmountSchema, createAssistanceRecordSchema } from "@/lib/validation/assistance";

const validWrite = {
  cooperativeId: "coop-1",
  assistanceTypeId: "type-1",
  amount: "1500.50",
  requestedAt: "2026-09-22",
};

describe("assistance amount and create schemas", () => {
  it("accepts a two-decimal amount and omits extra fields", () => {
    const parsed = createAssistanceRecordSchema.parse({
      ...validWrite,
      fundSource: "  LGU  ",
      remarks: "  ",
      extraField: "must-not-assign",
    });

    expect(parsed.amount).toBe("1500.50");
    expect(parsed.fundSource).toBe("LGU");
    expect(parsed.remarks).toBeNull();
    expect(parsed.requestedAt).toBeInstanceOf(Date);
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects zero, negative, and over-precise amounts", () => {
    expect(() => assistanceAmountSchema.parse("0")).toThrow();
    expect(() => assistanceAmountSchema.parse(-10)).toThrow();
    expect(() => assistanceAmountSchema.parse("10.123")).toThrow();
    expect(() => assistanceAmountSchema.parse("abc")).toThrow();
  });
});
