import type { AuthRole } from "@/lib/auth/roles";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: AuthRole;
  isActive: boolean;
};

export type SessionSnapshot = {
  user?: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: AuthRole;
    isActive?: boolean;
  };
} | null;

type SessionReader = () => Promise<SessionSnapshot>;

export async function getSessionUser(
  readSession: SessionReader,
): Promise<SessionUser | null> {
  const session = await readSession();
  const user = session?.user;

  if (!user?.id || !user.email || !user.role) {
    return null;
  }

  if (user.isActive !== true) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    isActive: true,
  };
}
