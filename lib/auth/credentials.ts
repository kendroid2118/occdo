import type { Role } from "@prisma/client";

import { verifyPasswordAgainstKnownHash } from "@/lib/auth/password";
import type { AuthRole } from "@/lib/auth/roles";
import { RateLimitError, assertRateLimit } from "@/lib/rate-limit";
import { credentialsSchema } from "@/lib/validation/auth";

export type AuthCredentialUser = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isActive: boolean;
  passwordHash: string | null;
};

export type AuthorizedSessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: AuthRole;
  isActive: true;
};

export async function authorizeCredentials(
  input: unknown,
  getUserByEmail: (email: string) => Promise<AuthCredentialUser | null>,
): Promise<AuthorizedSessionUser | null> {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  const email = parsed.data.email.toLowerCase();

  try {
    await assertRateLimit(`auth:credentials:${email}`);
  } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return null;
    }
    throw error;
  }

  const user = await getUserByEmail(email);
  const passwordOk = await verifyPasswordAgainstKnownHash(
    parsed.data.password,
    user?.passwordHash ?? null,
  );

  if (!user || !user.isActive || !passwordOk) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: true,
  };
}
