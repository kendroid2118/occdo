import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { getCurrentSessionUser } from "@/lib/auth/current-session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const sessionUser = await getCurrentSessionUser();
  if (sessionUser) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <main className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          LGU Ormoc
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">OCCDO sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Internal staff access only. Use your OCCDO account.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
