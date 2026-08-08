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
  const [precio, setPrecio] = useState("");
  const [yaPago, setYaPago] = useState(false);

  function handleTramiteChange(id: string) {
    setTramiteId(id);
    const tramite = tramites.find((t) => t.id === id);
    if (tramite && !precio) {
      setPrecio(String(tramite.honorarioBase));
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
            Precio cotizado (opcional, MXN)
          </label>
          <input
            type="number"
            name="precioCobrado"
            min={0}
            step={1}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Honorario a cobrar"
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          name="yaPago"
          checked={yaPago}
          onChange={(e) => setYaPago(e.target.checked)}
          className="h-4 w-4 rounded border-ink/30"
        />
        Ya pagó los honorarios
      </label>
      {yaPago && (
        <p className="-mt-2 text-xs text-ink/50">
          Se marca el caso como pagado y se genera el recibo automáticamente
          por {precio ? `$${precio} MXN` : "el precio cotizado"}.
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
