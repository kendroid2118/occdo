"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/lib/auth";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { mapLoginError, type LoginResult } from "@/lib/auth/login-errors";
import { writeAuditLog } from "@/lib/dal/audit";
import { assertLoginRateLimit } from "@/lib/rate-limit";
import { credentialsSchema } from "@/lib/validation/auth";

function clientIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  return forwardedIp || headerList.get("x-real-ip")?.trim() || "unknown";
}

export async function loginAction(
  _previous: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, code: "VALIDATION" };
  }

  const email = parsed.data.email.toLowerCase();
  const headerList = await headers();

  try {
    await assertLoginRateLimit(clientIp(headerList), email);
  } catch (error: unknown) {
    return { ok: false, code: mapLoginError(error) };
  }

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error: unknown) {
    if (isNextRedirect(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      return { ok: false, code: "INVALID_CREDENTIALS" };
    }
    return { ok: false, code: mapLoginError(error) };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const user = await getCurrentSessionUser();
  if (user) {
    await writeAuditLog({
      actorId: user.id,
      action: "SIGN_OUT",
      entityType: "User",
      entityId: user.id,
      source: "WEB",
    });
  }

  await signOut({ redirectTo: "/login" });
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
