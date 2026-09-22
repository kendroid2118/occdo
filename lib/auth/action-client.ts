import type { z } from "zod";

import { AuthzError, requireRole } from "@/lib/auth/rbac";
import type { AuthRole } from "@/lib/auth/roles";
import type { SessionUser } from "@/lib/auth/session";
import { RateLimitError, assertActionRateLimit } from "@/lib/rate-limit";

export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "VALIDATION";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ActionErrorCode };

export type RoleActionHandler<TInput, TData> = (context: {
  user: SessionUser;
  input: TInput;
}) => Promise<TData>;

type RoleActionDeps = {
  getUser: () => Promise<SessionUser | null>;
  rateLimit: (identifier: string) => Promise<void>;
};

export async function runRoleAction<TSchema extends z.ZodType, TData>(
  options: {
    input: unknown;
    schema: TSchema;
    roles: readonly AuthRole[];
    handler: RoleActionHandler<z.infer<TSchema>, TData>;
  },
  deps: RoleActionDeps,
): Promise<ActionResult<TData>> {
  const user = await deps.getUser();
  if (!user) {
    return { ok: false, code: "UNAUTHORIZED" };
  }

  try {
    await deps.rateLimit(`action:${user.id}`);
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return { ok: false, code: "RATE_LIMITED" };
    }
    throw error;
  }

  const parsed = options.schema.safeParse(options.input);
  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  try {
    requireRole(user, options.roles);
  } catch (error: unknown) {
    if (error instanceof AuthzError) {
      return { ok: false, code: error.code };
    }
    throw error;
  }

  const data = await options.handler({
    user,
    input: parsed.data,
  });

  return { ok: true, data };
}

export function roleActionClient<TSchema extends z.ZodType, TData>(options: {
  schema: TSchema;
  roles: readonly AuthRole[];
  handler: RoleActionHandler<z.infer<TSchema>, TData>;
}): (input: unknown) => Promise<ActionResult<TData>> {
  return async (input: unknown) => {
    const { getCurrentSessionUser } = await import("@/lib/auth/current-session");
    return runRoleAction(
      {
        input,
        schema: options.schema,
        roles: options.roles,
        handler: options.handler,
      },
      {
        getUser: getCurrentSessionUser,
        rateLimit: (identifier) => assertActionRateLimit(identifier),
      },
    );
  };
}
