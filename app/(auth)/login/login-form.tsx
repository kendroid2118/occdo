"use client";

import { useActionState } from "react";

import { loginAction } from "@/lib/actions/auth";
import { LOGIN_ERROR_MESSAGE, type LoginResult } from "@/lib/auth/login-errors";
import { Button } from "@/components/ui/button";

const initialState: LoginResult | null = null;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const errorMessage =
    state && state.ok === false ? LOGIN_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="username"
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-800" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
