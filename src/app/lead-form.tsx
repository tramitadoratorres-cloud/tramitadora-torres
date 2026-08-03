"use client";

import { useActionState } from "react";
import { crearLeadAction, type LeadFormState } from "./lead-actions";

const initialState: LeadFormState = {};

type Tramite = { id: string; nombre: string };

export function LeadForm({ tramites }: { tramites: Tramite[] }) {
  const [state, formAction, pending] = useActionState(
    crearLeadAction,
    initialState
  );

  if (state.ok) {
    return (
      <div className="rounded-lg bg-navy-900/5 p-6 text-center">
        <p className="font-serif text-lg font-semibold text-ink">
          ¡Gracias! Ya recibimos tus datos.
        </p>
        <p className="mt-2 text-sm text-ink/70">
          En breve te contactamos por WhatsApp o teléfono para darte
          seguimiento.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Nombre
          </label>
          <input
            name="nombre"
            required
            className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            WhatsApp / Teléfono
          </label>
          <input
            name="telefono"
            required
            className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Trámite de tu interés
        </label>
        <select
          name="tramiteCatalogoId"
          defaultValue=""
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
        >
          <option value="">Aún no estoy seguro</option>
          {tramites.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Mensaje (opcional)
        </label>
        <textarea
          name="mensaje"
          rows={3}
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
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
        className="rounded bg-navy-900 px-5 py-3 font-mono text-sm font-semibold text-cream transition hover:bg-navy-700 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mis datos"}
      </button>
    </form>
  );
}
