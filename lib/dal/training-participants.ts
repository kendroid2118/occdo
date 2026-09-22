import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { CooperativeNotFoundError } from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import { TrainingEventNotFoundError } from "@/lib/dal/training-events";
import type { CreateTrainingParticipantInput } from "@/lib/validation/training-participant";

const participantListSelect = {
  id: true,
  trainingEventId: true,
  cooperativeId: true,
  fullName: true,
  attendanceStatus: true,
  createdAt: true,
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
} as const;

const eventForCooperativeSelect = {
  id: true,
  title: true,
  kind: true,
  startAt: true,
  endAt: true,
  venue: true,
} as const;

export type TrainingParticipantListRecord = Prisma.TrainingParticipantGetPayload<{
  select: typeof participantListSelect;
}>;

export type CooperativeTrainingEventRecord = Prisma.TrainingEventGetPayload<{
  select: typeof eventForCooperativeSelect;
}>;

function participantSnapshot(row: TrainingParticipantListRecord) {
  return {
    trainingEventId: row.trainingEventId,
    cooperativeId: row.cooperativeId,
    fullName: row.fullName,
    attendanceStatus: row.attendanceStatus,
  };
}

async function assertWritableReferences(
  tx: Prisma.TransactionClient,
  input: { trainingEventId: string; cooperativeId?: string | null },
): Promise<{ cooperativeId: string | null }> {
  const [event, cooperative] = await Promise.all([
    tx.trainingEvent.findUnique({
      where: { id: input.trainingEventId },
      select: { id: true },
    }),
    input.cooperativeId
      ? tx.cooperative.findUnique({
          where: { id: input.cooperativeId },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!event) {
    throw new TrainingEventNotFoundError();
  }
  if (input.cooperativeId && !cooperative) {
    throw new CooperativeNotFoundError();
  }

  return { cooperativeId: cooperative?.id ?? null };
}

export async function listParticipantsByEventId(
  trainingEventId: string,
): Promise<TrainingParticipantListRecord[]> {
  return prisma.trainingParticipant.findMany({
    where: { trainingEventId },
    select: participantListSelect,
    orderBy: [{ fullName: "asc" }, { id: "asc" }],
  });
}

export async function listTrainingEventsByCooperativeId(
  cooperativeId: string,
): Promise<CooperativeTrainingEventRecord[]> {
  return prisma.trainingEvent.findMany({
    where: { participants: { some: { cooperativeId } } },
    select: eventForCooperativeSelect,
    orderBy: [{ startAt: "desc" }, { id: "desc" }],
  });
}

export async function createTrainingParticipant(options: {
  input: CreateTrainingParticipantInput;
  actorId: string;
}): Promise<TrainingParticipantListRecord> {
  return prisma.$transaction(async (tx) => {
    const refs = await assertWritableReferences(tx, options.input);

    const created = await tx.trainingParticipant.create({
      data: {
        trainingEventId: options.input.trainingEventId,
        cooperativeId: refs.cooperativeId,
        fullName: options.input.fullName,
        attendanceStatus: options.input.attendanceStatus,
        contactNumber: options.input.contactNumber,
      },
      select: participantListSelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "TRAINING_PARTICIPANT_CREATE",
        entityType: "TrainingParticipant",
        entityId: created.id,
        source: "WEB",
        metadata: { after: participantSnapshot(created) },
      },
      tx,
    );

    return created;
  });
}
