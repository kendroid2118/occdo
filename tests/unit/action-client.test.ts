import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { runRoleAction } from "@/lib/auth/action-client";
import type { SessionUser } from "@/lib/auth/session";
import { RateLimitError } from "@/lib/rate-limit";

const schema = z.object({
  label: z.string().trim().min(1),
});

const admin: SessionUser = {
  id: "admin-1",
  email: "admin@example.invalid",
  name: "Admin",
  role: "ADMIN",
  isActive: true,
};

describe("runRoleAction", () => {
  it("returns UNAUTHORIZED when there is no session", async () => {
    const result = await runRoleAction(
      {
        input: { label: "ok" },
        schema,
        roles: ["ADMIN"],
        handler: async () => ({ done: true }),
      },
      {
        getUser: async () => null,
        rateLimit: async () => undefined,
      },
    );

    expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
  });

  it("returns RATE_LIMITED before validation when the limiter rejects", async () => {
    const result = await runRoleAction(
      {
        input: { label: "" },
        schema,
        roles: ["ADMIN"],
        handler: async () => ({ done: true }),
      },
      {
        getUser: async () => admin,
        rateLimit: async () => {
          throw new RateLimitError();
        },
      },
    );

    expect(result).toEqual({ ok: false, code: "RATE_LIMITED" });
  });

  it("returns VALIDATION for invalid input", async () => {
    const result = await runRoleAction(
      {
        input: { label: "" },
        schema,
        roles: ["ADMIN"],
        handler: async () => ({ done: true }),
      },
      {
        getUser: async () => admin,
        rateLimit: async () => undefined,
      },
    );

    expect(result).toEqual({ ok: false, code: "VALIDATION" });
  });

  it("returns FORBIDDEN when the role is not allowed", async () => {
    const result = await runRoleAction(
      {
        input: { label: "ok" },
        schema,
        roles: ["SUPER_ADMIN"],
        handler: async () => ({ done: true }),
      },
      {
        getUser: async () => admin,
        rateLimit: async () => undefined,
      },
    );

    expect(result).toEqual({ ok: false, code: "FORBIDDEN" });
  });

  it("returns data when auth, rate limit, Zod, and role succeed", async () => {
    const handler = vi.fn(async ({ user, input }: { user: SessionUser; input: { label: string } }) => {
      expect(user).not.toHaveProperty("passwordHash");
      return { label: input.label, actorId: user.id };
    });

    const result = await runRoleAction(
      {
        input: { label: "ok" },
        schema,
        roles: ["ADMIN", "SUPER_ADMIN"],
        handler,
      },
      {
        getUser: async () => admin,
        rateLimit: async () => undefined,
      },
    );

    expect(result).toEqual({
      ok: true,
      data: { label: "ok", actorId: "admin-1" },
    });
    expect(handler).toHaveBeenCalledOnce();
  });
});
