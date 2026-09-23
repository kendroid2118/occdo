"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { hashPassword } from "@/lib/auth/password";
import {
  LastSuperAdminError,
  UserConflictError,
  UserNotFoundError,
  UserRoleAssignmentError,
  createManagedUser,
  getUserByIdForUi,
  listUsersForUi,
  updateManagedUser,
  type UserForUi,
} from "@/lib/dal/users";
import { USER_ADMIN_ROLES } from "@/lib/users/access";
import {
  createManagedUserSchema,
  getManagedUserSchema,
  listManagedUsersSchema,
  updateManagedUserSchema,
} from "@/lib/validation/users";

export type { UserForUi };

export type UserActionErrorCode = ActionErrorCode | "NOT_FOUND" | "CONFLICT";

export type UserActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: UserActionErrorCode };

async function mapUserAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<UserActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof UserNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof UserConflictError || error instanceof LastSuperAdminError) {
      return { ok: false, code: "CONFLICT" };
    }
    if (error instanceof UserRoleAssignmentError) {
      return { ok: false, code: "FORBIDDEN" };
    }
    throw error;
  }
}

const listInner = roleActionClient({
  schema: listManagedUsersSchema,
  roles: USER_ADMIN_ROLES,
  handler: async () => listUsersForUi(),
});

const getInner = roleActionClient({
  schema: getManagedUserSchema,
  roles: USER_ADMIN_ROLES,
  handler: async ({ input }) => {
    const user = await getUserByIdForUi(input.id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  },
});

const createInner = roleActionClient({
  schema: createManagedUserSchema,
  roles: USER_ADMIN_ROLES,
  handler: async ({ user, input }) => {
    const passwordHash = await hashPassword(input.password);
    return createManagedUser({
      actorId: user.id,
      actorRole: user.role,
      input: {
        email: input.email,
        name: input.name,
        role: input.role,
        isActive: input.isActive,
        passwordHash,
      },
    });
  },
});

const updateInner = roleActionClient({
  schema: updateManagedUserSchema,
  roles: USER_ADMIN_ROLES,
  handler: async ({ user, input }) =>
    updateManagedUser({
      actorId: user.id,
      actorRole: user.role,
      input,
    }),
});

export async function listManagedUsersAction(
  input: unknown,
): Promise<UserActionResult<UserForUi[]>> {
  return mapUserAction(() => listInner(input));
}

export async function getManagedUserAction(
  input: unknown,
): Promise<UserActionResult<UserForUi>> {
  return mapUserAction(() => getInner(input));
}

export async function createManagedUserAction(
  input: unknown,
): Promise<UserActionResult<UserForUi>> {
  return mapUserAction(() => createInner(input));
}

export async function updateManagedUserAction(
  input: unknown,
): Promise<UserActionResult<UserForUi>> {
  return mapUserAction(() => updateInner(input));
}

function userFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
  };
}

export async function createManagedUserFormAction(
  _previous: UserActionResult<UserForUi> | null,
  formData: FormData,
): Promise<UserActionResult<UserForUi>> {
  const result = await createManagedUserAction(userFormValues(formData));
  if (result.ok) {
    redirect("/settings/users");
  }
  return result;
}

export async function updateManagedUserFormAction(
  _previous: UserActionResult<UserForUi> | null,
  formData: FormData,
): Promise<UserActionResult<UserForUi>> {
  const result = await updateManagedUserAction(userFormValues(formData));
  if (result.ok) {
    redirect("/settings/users");
  }
  return result;
}
