"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="font-mono text-xs uppercase tracking-wide text-ink/60">
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none focus:border-navy-700"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="font-mono text-xs uppercase tracking-wide text-ink/60">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none focus:border-navy-700"
        />
      </div>

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded bg-navy-900 px-4 py-2.5 font-mono text-sm font-medium text-cream transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar al CRM"}
      </button>
    </form>
  );
}
