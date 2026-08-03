"use client";

import { useActionState } from "react";
import { crearClienteAction, type FormState } from "./actions";

const initialState: FormState = {};

export function ClienteForm() {
  const [state, formAction, pending] = useActionState(
    crearClienteAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Nombre completo
        </label>
        <input
          name="nombre"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Teléfono / WhatsApp
        </label>
        <input
          name="telefono"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Correo (opcional)
        </label>
        <input
          name="email"
          type="email"
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Nota inicial (opcional)
        </label>
        <textarea
          name="mensaje"
          rows={3}
          placeholder="Ej. interesado en visa de turista, contactó por WhatsApp…"
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
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
        className="self-start rounded bg-navy-900 px-4 py-2 font-mono text-xs font-medium text-cream transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar cliente"}
      </button>
    </form>
  );
}
