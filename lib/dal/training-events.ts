import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { CooperativeReferenceError } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type {
  CreateTrainingEventInput,
  ListTrainingEventsInput,
  UpdateTrainingEventInput,
} from "@/lib/validation/training-event";

export class TrainingEventNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Training event not found");
    this.name = "TrainingEventNotFoundError";
  }
}

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const eventSelect = {
  id: true,
  title: true,
  kind: true,
  startAt: true,
  endAt: true,
  venue: true,
  programId: true,
  serviceTypeId: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
  program: { select: referenceNameSelect },
  serviceType: { select: referenceNameSelect },
} as const;

export type TrainingEventRecord = Prisma.TrainingEventGetPayload<{
  select: typeof eventSelect;
}>;

export type TrainingEventListResult = {
  items: TrainingEventRecord[];
  page: number;
  pageSize: number;
  total: number;
};

function eventSnapshot(row: TrainingEventRecord) {
  return {
    title: row.title,
    kind: row.kind,
    startAt: row.startAt,
    endAt: row.endAt,
    venue: row.venue,
    programId: row.programId,
    serviceTypeId: row.serviceTypeId,
  };
}

async function assertOptionalCatalogs(
  tx: Prisma.TransactionClient,
  input: { programId?: string | null; serviceTypeId?: string | null },
): Promise<{ programId: string | null; serviceTypeId: string | null }> {
  const [program, serviceType] = await Promise.all([
    input.programId
      ? tx.program.findFirst({
          where: { id: input.programId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: null as string | null }),
    input.serviceTypeId
      ? tx.serviceType.findFirst({
          where: { id: input.serviceTypeId, isActive: true },
          select: { id: true },
        })
      : Promise.resolve({ id: null as string | null }),
  ]);

  if (input.programId && !program?.id) {
    throw new CooperativeReferenceError();
  }
  if (input.serviceTypeId && !serviceType?.id) {
    throw new CooperativeReferenceError();
  }

  return {
    programId: program?.id ?? null,
    serviceTypeId: serviceType?.id ?? null,
  };
}

export async function createTrainingEvent(options: {
  input: CreateTrainingEventInput;
  actorId: string;
}): Promise<TrainingEventRecord> {
  return prisma.$transaction(async (tx) => {
    const catalogs = await assertOptionalCatalogs(tx, options.input);

    const created = await tx.trainingEvent.create({
      data: {
        title: options.input.title,
        kind: options.input.kind,
        startAt: options.input.startAt,
        endAt: options.input.endAt ?? null,
        venue: options.input.venue,
        programId: catalogs.programId,
        serviceTypeId: catalogs.serviceTypeId,
        remarks: options.input.remarks,
        createdById: options.actorId,
        updatedById: options.actorId,
      },
      select: eventSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "TRAINING_EVENT_CREATE",
        entityType: "TrainingEvent",
        entityId: created.id,
        source: "WEB",
        metadata: { after: eventSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}

export async function updateTrainingEvent(options: {
  input: UpdateTrainingEventInput;
  actorId: string;
}): Promise<TrainingEventRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.trainingEvent.findUnique({
      where: { id: options.input.id },
      select: eventSelect,
    });
    if (!existing) {
      throw new TrainingEventNotFoundError();
    }

    const catalogs = await assertOptionalCatalogs(tx, options.input);

    const updated = await tx.trainingEvent.update({
      where: { id: existing.id },
      data: {
        title: options.input.title,
        kind: options.input.kind,
        startAt: options.input.startAt,
        endAt: options.input.endAt ?? null,
        venue: options.input.venue,
        programId: catalogs.programId,
        serviceTypeId: catalogs.serviceTypeId,
        remarks: options.input.remarks,
        updatedById: options.actorId,
      },
      select: eventSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "TRAINING_EVENT_UPDATE",
        entityType: "TrainingEvent",
        entityId: updated.id,
        source: "WEB",
        metadata: {
          before: eventSnapshot(existing),
          after: eventSnapshot(updated),
        },
      },
      tx,
    );

    return updated;
  });
}

export async function getTrainingEventById(
  id: string,
): Promise<TrainingEventRecord | null> {
  return prisma.trainingEvent.findUnique({
    where: { id },
    select: eventSelect,
  });
}

export async function listTrainingEvents(
  input: ListTrainingEventsInput,
): Promise<TrainingEventListResult> {
  const where: Prisma.TrainingEventWhereInput = {};
  if (input.kind) {
    where.kind = input.kind;
  }

  const skip = (input.page - 1) * input.pageSize;
  const [total, items] = await prisma.$transaction([
    prisma.trainingEvent.count({ where }),
    prisma.trainingEvent.findMany({
      where,
      select: eventSelect,
      orderBy: [{ startAt: "desc" }, { id: "desc" }],
      skip,
      take: input.pageSize,
    }),
  ]);

  return {
    items,
    page: input.page,
    pageSize: input.pageSize,
    total,
  };
}
