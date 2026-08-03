"use client";

import { useActionState, useState } from "react";
import type { db } from "@/lib/db";
import { crearClienteAction, type FormState } from "./actions";

type Tramite = Awaited<ReturnType<typeof db.tramiteCatalogo.findMany>>[number];

const initialState: FormState = {};

export function ClienteForm({ tramites }: { tramites: Tramite[] }) {
  const [state, formAction, pending] = useActionState(
    crearClienteAction,
    initialState
  );
  const [tramiteId, setTramiteId] = useState("");
  const [monto, setMonto] = useState("");

  function handleTramiteChange(id: string) {
    setTramiteId(id);
    const tramite = tramites.find((t) => t.id === id);
    if (tramite && !monto) {
      setMonto(String(tramite.honorarioBase));
    }
  }

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Trámite (opcional)
          </label>
          <select
            name="tramiteCatalogoId"
            value={tramiteId}
            onChange={(e) => handleTramiteChange(e.target.value)}
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">Aún no se sabe</option>
            {tramites.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Cuánto pagó (opcional, MXN)
          </label>
          <input
            type="number"
            name="montoPagado"
            min={0}
            step={1}
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Déjalo vacío si aún no paga"
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>
      {monto && (
        <p className="-mt-2 text-xs text-ink/50">
          Si ya pagó, el caso se marca como pagado y se genera el recibo
          automáticamente.
        </p>
      )}

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
