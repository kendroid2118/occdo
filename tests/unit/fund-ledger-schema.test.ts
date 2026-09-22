import { describe, expect, it } from "vitest";

import {
  createFundLedgerEntrySchema,
  ledgerAmountSchema,
} from "@/lib/validation/fund-ledger";

describe("fund ledger schemas", () => {
  it("accepts a recovery entry and omits extra fields", () => {
    const parsed = createFundLedgerEntrySchema.parse({
      assistanceRecordId: "assist-1",
      cooperativeId: "coop-1",
      entryDate: "2026-09-22",
      amount: "100.50",
      entryKind: "RECOVERY",
      remarks: "  ",
      extraField: "must-not-assign",
    });

    expect(parsed.amount).toBe("100.50");
    expect(parsed.entryKind).toBe("RECOVERY");
    expect(parsed.remarks).toBeNull();
    expect(parsed).not.toHaveProperty("extraField");
  });

  it("rejects zero, negative, over-precise, and disbursement kinds", () => {
    expect(() => ledgerAmountSchema.parse("0")).toThrow();
    expect(() => ledgerAmountSchema.parse("-10")).toThrow();
    expect(() => ledgerAmountSchema.parse("10.123")).toThrow();
    expect(() =>
      createFundLedgerEntrySchema.parse({
        assistanceRecordId: "assist-1",
        cooperativeId: "coop-1",
        entryDate: "2026-09-22",
        amount: "10.00",
        entryKind: "DISBURSEMENT",
      }),
    ).toThrow();
  });
});
