export const FUND_LEDGER_ENTRY_KINDS = [
  "DISBURSEMENT",
  "ADJUSTMENT",
  "RECOVERY",
] as const;

export const MANUAL_FUND_LEDGER_ENTRY_KINDS = ["ADJUSTMENT", "RECOVERY"] as const;

export type FundLedgerEntryKindValue = (typeof FUND_LEDGER_ENTRY_KINDS)[number];
