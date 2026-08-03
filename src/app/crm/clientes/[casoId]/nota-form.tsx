"use client";

import { useActionState, useRef } from "react";
import { agregarNotaAction, type FormState } from "./actions";

const initialState: FormState = {};

export function NotaForm({ casoId }: { casoId: string }) {
  const action = agregarNotaAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-3"
    >
      <textarea
        name="nota"
        rows={3}
        required
        placeholder="Ej. cliente confirmó cita para el jueves…"
        className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
      />
      <label className="flex items-center gap-2 text-xs text-ink/60">
        <input type="checkbox" name="visibleCliente" />
        Compartir esta nota en el ticket virtual del cliente
      </label>
      {state.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded border border-ink/15 px-3 py-2 font-mono text-xs transition hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Agregar nota"}
      </button>
    </form>
  );
}
