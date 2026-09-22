import "server-only";

import type { Role } from "@prisma/client";

import { prisma } from "@/lib/dal/prisma";
import { userUiSelect, type UserForUi } from "@/lib/dal/user-select";

export type { UserForUi };

export type AuthCredentialUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  passwordHash: string | null;
};

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

/** Auth.js credentials only. Callers must not return this record to the client. */
export async function getUserAuthByEmail(
  email: string,
): Promise<AuthCredentialUser | null> {
  return prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });
}
