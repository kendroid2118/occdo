import { auth } from "@/lib/auth";
import { getSessionUser, type SessionSnapshot, type SessionUser } from "@/lib/auth/session";

export type { SessionUser };

export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  return getSessionUser(async () => {
    const session = await auth();
    return (session ?? null) as SessionSnapshot;
  });
}
