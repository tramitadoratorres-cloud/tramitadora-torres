"use client";

import { useActionState, useState } from "react";
import { actualizarClienteAction, type FormState } from "./actions";

const initialState: FormState = {};

export function ClienteInfo({
  clienteId,
  casoId,
  nombre,
  telefono,
  email,
}: {
  clienteId: string;
  casoId: string;
  nombre: string;
  telefono: string;
  email: string | null;
}) {
  const [editando, setEditando] = useState(false);
  const action = actualizarClienteAction.bind(null, clienteId, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (editando) {
    return (
      <form
        action={async (formData) => {
          await formAction(formData);
          setEditando(false);
        }}
        className="flex flex-col gap-2"
      >
        <input
          name="nombre"
          defaultValue={nombre}
          required
          placeholder="Nombre completo"
          className="rounded border border-ink/15 px-3 py-2 font-serif text-lg font-semibold text-ink"
        />
        <input
          name="telefono"
          defaultValue={telefono}
          required
          placeholder="Teléfono / WhatsApp"
          className="rounded border border-ink/15 px-3 py-2 text-sm text-ink"
        />
        <input
          name="email"
          type="email"
          defaultValue={email ?? ""}
          placeholder="Correo (opcional)"
          className="rounded border border-ink/15 px-3 py-2 text-sm text-ink"
        />
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-navy-900 px-3 py-1.5 font-mono text-xs text-cream transition hover:bg-navy-700 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs transition hover:border-navy-700"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-serif text-2xl font-semibold text-ink">
          {nombre}
        </h1>
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="font-mono text-xs text-ink/40 hover:text-navy-700"
        >
          Editar
        </button>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        {telefono}
        {email ? ` · ${email}` : ""}
      </p>
    </div>
  );
}
