import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeCredentials } from "@/lib/auth/credentials";
import { getUserAuthByEmail } from "@/lib/dal/users";
import { env } from "@/lib/env";

export const authConfig = {
  secret: env.AUTH_SECRET,
  // Local App Router requires a trusted host. Production stays opt-in via AUTH_TRUST_HOST.
  trustHost: env.NODE_ENV !== "production" || env.AUTH_TRUST_HOST === "true",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        return authorizeCredentials(credentials, getUserAuthByEmail);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isActive = user.isActive;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.isActive = token.isActive === true;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
