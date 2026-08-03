"use client";

import { useActionState, useRef, useState } from "react";
import { crearTramiteAction, type FormState } from "./actions";

const initialState: FormState = {};

export function NuevoTramiteForm() {
  const [abierto, setAbierto] = useState(false);
  const [state, formAction, pending] = useActionState(
    crearTramiteAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded border border-dashed border-ink/25 px-4 py-3 font-mono text-xs text-ink/60 hover:border-navy-700 hover:text-navy-700"
      >
        + Agregar trámite al catálogo
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const result = await formAction(formData);
        return result;
      }}
      className="flex flex-col gap-3 rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
    >
      <h3 className="font-serif text-lg font-semibold text-ink">
        Nuevo trámite
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          name="nombre"
          placeholder="Nombre del trámite"
          required
          className="rounded border border-ink/15 px-3 py-2 text-sm"
        />
        <input
          type="number"
          name="honorarioBase"
          placeholder="Honorario base (MXN)"
          min={0}
          required
          className="rounded border border-ink/15 px-3 py-2 text-sm"
        />
      </div>
      <input
        name="descripcion"
        placeholder="Descripción corta"
        className="rounded border border-ink/15 px-3 py-2 text-sm"
      />
      <input
        name="badge"
        placeholder="Etiqueta (ej. Nuevo, Renovación…)"
        className="rounded border border-ink/15 px-3 py-2 text-sm"
      />
      <textarea
        name="requisitos"
        rows={3}
        placeholder="Requisitos, uno por línea"
        className="rounded border border-ink/15 px-3 py-2 text-sm"
      />

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-navy-900 px-4 py-2 font-mono text-xs text-cream hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Agregar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="rounded border border-ink/15 px-4 py-2 font-mono text-xs"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
