"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "@/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p
          role="alert"
          className="border border-ink/20 bg-mist px-4 py-3 text-sm leading-relaxed"
        >
          {state.error}
        </p>
      ) : null}

      <label className="block">
        <span className="admin-label">Username</span>
        <input
          type="text"
          name="username"
          autoComplete="username"
          required
          autoFocus
          className="admin-input"
        />
      </label>

      <label className="block">
        <span className="admin-label">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className="admin-input"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="label flex w-full items-center justify-between bg-ink px-5 py-4 text-white transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
