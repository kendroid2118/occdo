import "server-only";

import { prisma } from "@/lib/dal/prisma";
import { userUiSelect, type UserForUi } from "@/lib/dal/user-select";

export type { UserForUi };

export async function listUsersForUi(): Promise<UserForUi[]> {
  return prisma.user.findMany({
    select: userUiSelect,
    orderBy: { email: "asc" },
  });
}

export async function getUserByIdForUi(id: string): Promise<UserForUi | null> {
  return prisma.user.findUnique({
    where: { id },
    select: userUiSelect,
  });
}
