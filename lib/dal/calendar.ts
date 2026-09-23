import "server-only";

import type { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import { prisma } from "@/lib/dal/prisma";
import { manilaDateTimeRange } from "@/lib/reports/manila-date-range";
import { toManilaCalendarDate } from "@/lib/reports/manila-date-range";
import type {
  CreateCalendarActivityInput,
  ListCalendarActivitiesInput,
  UpdateCalendarActivityInput,
} from "@/lib/validation/calendar";

export class CalendarActivityNotFoundError extends Error {
  readonly code = "NOT_FOUND" as const;

  constructor() {
    super("Calendar activity not found");
    this.name = "CalendarActivityNotFoundError";
  }
}

export class CalendarActivityReferenceError extends Error {
  readonly code = "VALIDATION" as const;

  constructor() {
    super("Invalid calendar activity reference");
    this.name = "CalendarActivityReferenceError";
  }
}

const activitySelect = {
  id: true,
  title: true,
  kind: true,
  startAt: true,
  endAt: true,
  location: true,
  remarks: true,
  cooperativeId: true,
  trainingEventId: true,
  createdAt: true,
  updatedAt: true,
  cooperative: {
    select: { id: true, cooperativeCode: true, name: true },
  },
  trainingEvent: {
    select: { id: true, title: true, startAt: true },
  },
} as const;

export type CalendarActivityRecord = Prisma.CalendarActivityGetPayload<{
  select: typeof activitySelect;
}>;

export type CalendarActivityListResult = {
  items: CalendarActivityRecord[];
  year: number;
  month: number;
};

export type CalendarLinkOptions = {
  cooperatives: { id: string; cooperativeCode: string; name: string }[];
  trainingEvents: { id: string; title: string; startAt: Date }[];
};

function activitySnapshot(row: CalendarActivityRecord) {
  return {
    title: row.title,
    kind: row.kind,
    startAt: row.startAt,
    endAt: row.endAt,
    location: row.location,
    cooperativeId: row.cooperativeId,
    trainingEventId: row.trainingEventId,
  };
}

async function assertOptionalLinks(
  tx: Prisma.TransactionClient,
  input: { cooperativeId?: string | null; trainingEventId?: string | null },
): Promise<{ cooperativeId: string | null; trainingEventId: string | null }> {
  const [cooperative, trainingEvent] = await Promise.all([
    input.cooperativeId
      ? tx.cooperative.findUnique({
          where: { id: input.cooperativeId },
          select: { id: true },
        })
      : Promise.resolve({ id: null as string | null }),
    input.trainingEventId
      ? tx.trainingEvent.findUnique({
          where: { id: input.trainingEventId },
          select: { id: true },
        })
      : Promise.resolve({ id: null as string | null }),
  ]);

  if (input.cooperativeId && !cooperative?.id) {
    throw new CalendarActivityReferenceError();
  }
  if (input.trainingEventId && !trainingEvent?.id) {
    throw new CalendarActivityReferenceError();
  }

  return {
    cooperativeId: cooperative?.id ?? null,
    trainingEventId: trainingEvent?.id ?? null,
  };
}

export function defaultCalendarMonth(asOf = new Date()): { year: number; month: number } {
  const ymd = toManilaCalendarDate(asOf);
  return {
    year: Number(ymd.slice(0, 4)),
    month: Number(ymd.slice(5, 7)),
  };
}

export async function listCalendarLinkOptions(): Promise<CalendarLinkOptions> {
  const [cooperatives, trainingEvents] = await Promise.all([
    prisma.cooperative.findMany({
      select: { id: true, cooperativeCode: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: 500,
    }),
    prisma.trainingEvent.findMany({
      select: { id: true, title: true, startAt: true },
      orderBy: [{ startAt: "desc" }, { id: "asc" }],
      take: 200,
    }),
  ]);
  return { cooperatives, trainingEvents };
}

export async function getCalendarActivityById(
  id: string,
): Promise<CalendarActivityRecord | null> {
  return prisma.calendarActivity.findUnique({
    where: { id },
    select: activitySelect,
  });
}

export async function listCalendarActivities(
  input: ListCalendarActivitiesInput,
  asOf = new Date(),
): Promise<CalendarActivityListResult> {
  const fallback = defaultCalendarMonth(asOf);
  const year = input.year ?? fallback.year;
  const month = input.month ?? fallback.month;
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const range = manilaDateTimeRange(startDate, endDate);

  const where: Prisma.CalendarActivityWhereInput = {
    startAt: { gte: range.startInclusive, lt: range.endExclusive },
  };
  if (input.kind) {
    where.kind = input.kind;
  }
  if (input.cooperativeId) {
    const cooperative = await prisma.cooperative.findUnique({
      where: { id: input.cooperativeId },
      select: { id: true },
    });
    if (!cooperative) {
      throw new CalendarActivityReferenceError();
    }
    where.cooperativeId = input.cooperativeId;
  }

  const items = await prisma.calendarActivity.findMany({
    where,
    select: activitySelect,
    orderBy: [{ startAt: "asc" }, { id: "asc" }],
  });

  return { items, year, month };
}

export async function listUpcomingCalendarActivities(options?: {
  asOf?: Date;
  take?: number;
}): Promise<CalendarActivityRecord[]> {
  const asOf = options?.asOf ?? new Date();
  const take = options?.take ?? 10;
  return prisma.calendarActivity.findMany({
    where: { startAt: { gte: asOf } },
    select: activitySelect,
    orderBy: [{ startAt: "asc" }, { id: "asc" }],
    take,
  });
}

export async function createCalendarActivity(options: {
  input: CreateCalendarActivityInput;
  actorId: string;
}): Promise<CalendarActivityRecord> {
  return prisma.$transaction(async (tx) => {
    const links = await assertOptionalLinks(tx, options.input);
    const created = await tx.calendarActivity.create({
      data: {
        title: options.input.title,
        kind: options.input.kind,
        startAt: options.input.startAt,
        endAt: options.input.endAt ?? null,
        location: options.input.location,
        remarks: options.input.remarks,
        cooperativeId: links.cooperativeId,
        trainingEventId: links.trainingEventId,
        createdById: options.actorId,
        updatedById: options.actorId,
      },
      select: activitySelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "CALENDAR_ACTIVITY_CREATE",
        entityType: "CalendarActivity",
        entityId: created.id,
        source: "WEB",
        metadata: { after: activitySnapshot(created) },
      },
      tx,
    );

    return created;
  });
}

export async function updateCalendarActivity(options: {
  input: UpdateCalendarActivityInput;
  actorId: string;
}): Promise<CalendarActivityRecord> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.calendarActivity.findUnique({
      where: { id: options.input.id },
      select: activitySelect,
    });
    if (!existing) {
      throw new CalendarActivityNotFoundError();
    }

    const links = await assertOptionalLinks(tx, options.input);
    const updated = await tx.calendarActivity.update({
      where: { id: existing.id },
      data: {
        title: options.input.title,
        kind: options.input.kind,
        startAt: options.input.startAt,
        endAt: options.input.endAt ?? null,
        location: options.input.location,
        remarks: options.input.remarks,
        cooperativeId: links.cooperativeId,
        trainingEventId: links.trainingEventId,
        updatedById: options.actorId,
      },
      select: activitySelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "CALENDAR_ACTIVITY_UPDATE",
        entityType: "CalendarActivity",
        entityId: updated.id,
        source: "WEB",
        metadata: { before: activitySnapshot(existing), after: activitySnapshot(updated) },
      },
      tx,
    );

    return updated;
  });
}
