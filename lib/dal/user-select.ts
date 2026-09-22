import type { Prisma } from "@prisma/client";

/**
 * Fields safe to return to UI/controllers. passwordHash is intentionally omitted.
 */
export const userUiSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

export type UserForUi = Prisma.UserGetPayload<{ select: typeof userUiSelect }>;
