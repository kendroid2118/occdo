import "server-only";

import { Prisma } from "@prisma/client";

import { writeAuditLog } from "@/lib/dal/audit";
import {
  CooperativeNotFoundError,
  CooperativeReferenceError,
} from "@/lib/dal/cooperatives";
import { prisma } from "@/lib/dal/prisma";
import type {
  CreateServiceDeliveryInput,
  ListServiceDeliveriesInput,
} from "@/lib/validation/service-delivery";

const referenceNameSelect = {
  id: true,
  code: true,
  name: true,
} as const;

const deliverySelect = {
  id: true,
  cooperativeId: true,
  programId: true,
  serviceTypeId: true,
  deliveredAt: true,
  remarks: true,
  recordedById: true,
  createdAt: true,
  updatedAt: true,
  cooperative: {
    select: {
      id: true,
      name: true,
      cooperativeCode: true,
    },
  },
  program: { select: referenceNameSelect },
  serviceType: { select: referenceNameSelect },
} as const;

export type ServiceDeliveryRecord = Prisma.ServiceDeliveryGetPayload<{
  select: typeof deliverySelect;
}>;

export type ServiceDeliveryListResult = {
  items: ServiceDeliveryRecord[];
  page: number;
  pageSize: number;
  total: number;
};

function deliverySnapshot(row: ServiceDeliveryRecord) {
  return {
    cooperativeId: row.cooperativeId,
    programId: row.programId,
    serviceTypeId: row.serviceTypeId,
    deliveredAt: row.deliveredAt,
  };
}

function startOfDay(value: Date): Date {
  const date = new Date(value);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date): Date {
  const date = new Date(value);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

function listWhere(input: ListServiceDeliveriesInput): Prisma.ServiceDeliveryWhereInput {
  const where: Prisma.ServiceDeliveryWhereInput = {};
  if (input.cooperativeId) {
    where.cooperativeId = input.cooperativeId;
  }
  if (input.serviceTypeId) {
    where.serviceTypeId = input.serviceTypeId;
  }
  if (input.deliveredFrom || input.deliveredTo) {
    where.deliveredAt = {};
    if (input.deliveredFrom) {
      where.deliveredAt.gte = startOfDay(input.deliveredFrom);
    }
    if (input.deliveredTo) {
      where.deliveredAt.lte = endOfDay(input.deliveredTo);
    }
  }
  return where;
}

export async function createServiceDelivery(options: {
  input: CreateServiceDeliveryInput;
  actorId: string;
}): Promise<ServiceDeliveryRecord> {
  return prisma.$transaction(async (tx) => {
    const [cooperative, serviceType, program] = await Promise.all([
      tx.cooperative.findUnique({
        where: { id: options.input.cooperativeId },
        select: { id: true },
      }),
      tx.serviceType.findFirst({
        where: { id: options.input.serviceTypeId, isActive: true },
        select: { id: true },
      }),
      options.input.programId
        ? tx.program.findFirst({
            where: { id: options.input.programId, isActive: true },
            select: { id: true },
          })
        : Promise.resolve({ id: null as string | null }),
    ]);

    if (!cooperative) {
      throw new CooperativeNotFoundError();
    }
    if (!serviceType || (options.input.programId && !program?.id)) {
      throw new CooperativeReferenceError();
    }

    const created = await tx.serviceDelivery.create({
      data: {
        cooperativeId: cooperative.id,
        serviceTypeId: serviceType.id,
        programId: program?.id ?? null,
        deliveredAt: options.input.deliveredAt,
        remarks: options.input.remarks,
        recordedById: options.actorId,
      },
      select: deliverySelect,
    });

    await writeAuditLog(
      {
        actorId: options.actorId,
        action: "SERVICE_DELIVERY_CREATE",
        entityType: "ServiceDelivery",
        entityId: created.id,
        source: "WEB",
        metadata: { after: deliverySnapshot(created) },
      },
      tx,
    );

    return created;
  });
}

export async function listServiceDeliveries(
  input: ListServiceDeliveriesInput,
): Promise<ServiceDeliveryListResult> {
  const where = listWhere(input);
  const skip = (input.page - 1) * input.pageSize;
  const [total, items] = await prisma.$transaction([
    prisma.serviceDelivery.count({ where }),
    prisma.serviceDelivery.findMany({
      where,
      select: deliverySelect,
      orderBy: [{ deliveredAt: "desc" }, { id: "desc" }],
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
