import "server-only";

import { Prisma } from "@prisma/client";

import { ASSISTANCE_STATUS_CODES } from "@/lib/assistance/status-codes";
import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import type {
  CreateFundLedgerEntryInput,
  ListFundLedgerEntriesInput,
} from "@/lib/validation/fund-ledger";

export class FundLedgerParentNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Assistance record not found");
    this.name = "FundLedgerParentNotFoundError";
  }
}

export class FundLedgerScopeError extends Error {
  readonly code = "FORBIDDEN" as const;

  constructor() {
    super("Assistance record does not belong to this cooperative");
    this.name = "FundLedgerScopeError";
  }
}

export class FundLedgerTransitionError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Ledger entry is not allowed for this assistance record");
    this.name = "FundLedgerTransitionError";
  }
}

export class FundLedgerConflictError extends Error {
  readonly code = "CONFLICT" as const;

  constructor() {
    super("A disbursement entry already exists for this assistance record");
    this.name = "FundLedgerConflictError";
  }
}

const ZERO = new Prisma.Decimal("0.00");

const entrySelect = {
  id: true,
  assistanceRecordId: true,
  entryDate: true,
  amount: true,
  entryKind: true,
  remarks: true,
  createdAt: true,
  recordedById: true,
} as const;

type FundLedgerEntryRow = Prisma.FundLedgerEntryGetPayload<{
  select: typeof entrySelect;
}>;

export type FundLedgerEntryRecord = Omit<FundLedgerEntryRow, "amount"> & {
  amount: string;
};

export type FundLedgerSummary = {
  disbursed: string;
  adjustments: string;
  recovered: string;
  net: string;
};

function serializeEntry(row: FundLedgerEntryRow): FundLedgerEntryRecord {
  return {
    ...row,
    amount: row.amount.toFixed(2),
  };
}

function moneySnapshot(row: FundLedgerEntryRecord) {
  return {
    assistanceRecordId: row.assistanceRecordId,
    entryKind: row.entryKind,
    amount: row.amount,
    entryDate: row.entryDate,
  };
}

function isUniqueConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

type ParentRow = {
  id: string;
  cooperativeId: string;
  amount: Prisma.Decimal;
  status: { code: string };
};

async function loadParent(
  db: Prisma.TransactionClient | typeof prisma,
  input: { assistanceRecordId: string; cooperativeId: string },
): Promise<ParentRow> {
  const parent = await db.assistanceRecord.findUnique({
    where: { id: input.assistanceRecordId },
    select: {
      id: true,
      cooperativeId: true,
      amount: true,
      status: { select: { code: true } },
    },
  });
  if (!parent) {
    throw new FundLedgerParentNotFoundError();
  }
  if (parent.cooperativeId !== input.cooperativeId) {
    throw new FundLedgerScopeError();
  }
  return parent;
}

async function insertLedgerEntry(
  tx: Prisma.TransactionClient,
  options: {
    assistanceRecordId: string;
    entryDate: Date;
    amount: Prisma.Decimal | string;
    entryKind: "DISBURSEMENT" | "ADJUSTMENT" | "RECOVERY";
    remarks?: string | null;
    actorId: string;
  },
): Promise<FundLedgerEntryRecord> {
  try {
    const created = await tx.fundLedgerEntry.create({
      data: {
        assistanceRecordId: options.assistanceRecordId,
        entryDate: options.entryDate,
        amount: options.amount,
        entryKind: options.entryKind,
        remarks: options.remarks ?? null,
        recordedById: options.actorId,
      },
      select: entrySelect,
    });
    const record = serializeEntry(created);

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "FUND_LEDGER_CREATE",
        entityType: "FundLedgerEntry",
        entityId: record.id,
        source: "WEB",
        metadata: { after: moneySnapshot(record) },
      },
      tx,
    );

    return record;
  } catch (error: unknown) {
    if (isUniqueConflict(error)) {
      throw new FundLedgerConflictError();
    }
    throw error;
  }
}

export async function insertReleaseDisbursement(
  tx: Prisma.TransactionClient,
  options: {
    assistanceRecordId: string;
    amount: string;
    entryDate: Date;
    actorId: string;
  },
): Promise<FundLedgerEntryRecord> {
  const existing = await tx.fundLedgerEntry.findFirst({
    where: {
      assistanceRecordId: options.assistanceRecordId,
      entryKind: "DISBURSEMENT",
    },
    select: { id: true },
  });
  if (existing) {
    throw new FundLedgerConflictError();
  }

  return insertLedgerEntry(tx, {
    assistanceRecordId: options.assistanceRecordId,
    entryDate: options.entryDate,
    amount: options.amount,
    entryKind: "DISBURSEMENT",
    remarks: "Release disbursement",
    actorId: options.actorId,
  });
}

export async function createFundLedgerEntry(options: {
  input: CreateFundLedgerEntryInput;
  actorId: string;
}): Promise<FundLedgerEntryRecord> {
  return prisma.$transaction(async (tx) => {
    const parent = await loadParent(tx, options.input);
    if (parent.status.code !== ASSISTANCE_STATUS_CODES.RELEASED) {
      throw new FundLedgerTransitionError();
    }

    return insertLedgerEntry(tx, {
      assistanceRecordId: parent.id,
      entryDate: options.input.entryDate,
      amount: options.input.amount,
      entryKind: options.input.entryKind,
      remarks: options.input.remarks,
      actorId: options.actorId,
    });
  });
}

export async function listFundLedgerEntries(
  input: ListFundLedgerEntriesInput,
): Promise<FundLedgerEntryRecord[]> {
  await loadParent(prisma, input);
  const rows = await prisma.fundLedgerEntry.findMany({
    where: { assistanceRecordId: input.assistanceRecordId },
    select: entrySelect,
    orderBy: [{ entryDate: "asc" }, { createdAt: "asc" }, { id: "asc" }],
  });
  return rows.map(serializeEntry);
}

function decimalSum(value: Prisma.Decimal | null): Prisma.Decimal {
  return value ?? ZERO;
}

export async function getFundLedgerSummary(
  input: ListFundLedgerEntriesInput,
): Promise<FundLedgerSummary> {
  await loadParent(prisma, input);
  const grouped = await prisma.fundLedgerEntry.groupBy({
    by: ["entryKind"],
    where: { assistanceRecordId: input.assistanceRecordId },
    _sum: { amount: true },
  });

  let disbursed = ZERO;
  let adjustments = ZERO;
  let recovered = ZERO;
  for (const row of grouped) {
    const sum = decimalSum(row._sum.amount);
    if (row.entryKind === "DISBURSEMENT") {
      disbursed = sum;
    } else if (row.entryKind === "ADJUSTMENT") {
      adjustments = sum;
    } else if (row.entryKind === "RECOVERY") {
      recovered = sum;
    }
  }

  const net = disbursed.plus(adjustments).minus(recovered);
  return {
    disbursed: disbursed.toFixed(2),
    adjustments: adjustments.toFixed(2),
    recovered: recovered.toFixed(2),
    net: net.toFixed(2),
  };
}
