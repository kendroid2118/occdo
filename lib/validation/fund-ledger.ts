import { Prisma } from "@prisma/client";
import { z } from "zod";

import { MANUAL_FUND_LEDGER_ENTRY_KINDS } from "@/lib/assistance/ledger-kinds";
import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const requiredDateSchema = z
  .union([z.string().datetime(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.date()])
  .transform((value) => (value instanceof Date ? value : new Date(value)));

const MAX_MONEY = new Prisma.Decimal("999999999.99");
const ZERO = new Prisma.Decimal("0");

export const ledgerAmountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => (typeof value === "number" ? value.toFixed(2) : value.trim()))
  .refine((value) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(value), {
    message: "Amount must be a number with up to two decimal places",
  })
  .refine((value) => {
    const amount = new Prisma.Decimal(value);
    return amount.greaterThan(ZERO) && amount.lessThanOrEqualTo(MAX_MONEY);
  }, { message: "Amount must be greater than zero" });

export const createFundLedgerEntrySchema = z.object({
  assistanceRecordId: referenceIdSchema,
  cooperativeId: referenceIdSchema,
  entryDate: requiredDateSchema,
  amount: ledgerAmountSchema,
  entryKind: z.enum(MANUAL_FUND_LEDGER_ENTRY_KINDS),
  remarks: optionalLongTextSchema,
});

export const listFundLedgerEntriesSchema = z.object({
  assistanceRecordId: referenceIdSchema,
  cooperativeId: referenceIdSchema,
});

export type CreateFundLedgerEntryInput = z.infer<typeof createFundLedgerEntrySchema>;
export type ListFundLedgerEntriesInput = z.infer<typeof listFundLedgerEntriesSchema>;
