import type { AuthRole } from "@/lib/auth/roles";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: AuthRole;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: AuthRole;
      isActive: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AuthRole;
    isActive?: boolean;
  }
}
