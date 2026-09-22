import "server-only";

import { prisma } from "@/lib/dal/prisma";
import type { ReferenceRecord } from "@/lib/dal/reference";

const catalogSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  sortOrder: true,
  isActive: true,
} as const;

export async function listActiveDocumentTemplates(): Promise<ReferenceRecord[]> {
  return prisma.documentTemplate.findMany({
    where: { isActive: true },
    select: catalogSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}
