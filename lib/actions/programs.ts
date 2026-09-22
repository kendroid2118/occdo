"use server";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  CatalogConflictError,
  createProgram,
  createServiceType,
} from "@/lib/dal/programs";
import {
  listActivePrograms,
  listActiveServiceTypes,
  type ReferenceRecord,
} from "@/lib/dal/reference";
import {
  createCatalogItemSchema,
  listProgramCatalogsSchema,
} from "@/lib/validation/program";

export type { ReferenceRecord };

export type ProgramCatalogs = {
  programs: ReferenceRecord[];
  serviceTypes: ReferenceRecord[];
};

export type ProgramActionErrorCode = ActionErrorCode | "CONFLICT";

export type ProgramActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ProgramActionErrorCode };

async function mapProgramAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<ProgramActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof CatalogConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

export const listProgramCatalogsAction = roleActionClient({
  schema: listProgramCatalogsSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<ProgramCatalogs> => {
    const [programs, serviceTypes] = await Promise.all([
      listActivePrograms(),
      listActiveServiceTypes(),
    ]);
    return { programs, serviceTypes };
  },
});

const createProgramInner = roleActionClient({
  schema: createCatalogItemSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => createProgram({ input, actorId: user.id }),
});

const createServiceTypeInner = roleActionClient({
  schema: createCatalogItemSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) =>
    createServiceType({ input, actorId: user.id }),
});

export async function createProgramAction(
  input: unknown,
): Promise<ProgramActionResult<ReferenceRecord>> {
  return mapProgramAction(() => createProgramInner(input));
}

export async function createServiceTypeAction(
  input: unknown,
): Promise<ProgramActionResult<ReferenceRecord>> {
  return mapProgramAction(() => createServiceTypeInner(input));
}
