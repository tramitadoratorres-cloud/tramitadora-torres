"use client";

import { useActionState, useState } from "react";
import type { db } from "@/lib/db";
import { asignarTramiteAction, type FormState } from "./actions";

type Tramite = Awaited<ReturnType<typeof db.tramiteCatalogo.findMany>>[number];

const initialState: FormState = {};

export function TramiteForm({
  casoId,
  tramites,
  tramiteActualId,
  precioActual,
  motivoActual,
}: {
  casoId: string;
  tramites: Tramite[];
  tramiteActualId: string | null;
  precioActual: number | null;
  motivoActual: string | null;
}) {
  const action = asignarTramiteAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [tramiteId, setTramiteId] = useState(tramiteActualId ?? "");
  const [precio, setPrecio] = useState(precioActual?.toString() ?? "");

  const tramiteSeleccionado = tramites.find((t) => t.id === tramiteId);

  function handleTramiteChange(id: string) {
    setTramiteId(id);
    const tramite = tramites.find((t) => t.id === id);
    if (tramite && !precioActual) {
      setPrecio(String(tramite.honorarioBase));
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Trámite
          </label>
          <select
            name="tramiteCatalogoId"
            value={tramiteId}
            onChange={(e) => handleTramiteChange(e.target.value)}
            required
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="" disabled>
              Selecciona un trámite
            </option>
            {tramites.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre} — honorario base {t.honorarioBase}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Precio cobrado (MXN)
          </label>
          <input
            type="number"
            name="precioCobrado"
            min={0}
            step={1}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          />
          {tramiteSeleccionado &&
            Number(precio) !== tramiteSeleccionado.honorarioBase && (
              <p className="text-xs text-gold-bright/80">
                Distinto al honorario base ({tramiteSeleccionado.honorarioBase}
                ). Anota el motivo del ajuste abajo.
              </p>
            )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Motivo del ajuste (opcional)
        </label>
        <input
          type="text"
          name="motivoAjuste"
          defaultValue={motivoActual ?? ""}
          placeholder="Ej. descuento por trámite familiar, cliente frecuente…"
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
      </div>

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm text-navy-700">Guardado correctamente.</p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-navy-900 px-4 py-2 font-mono text-xs font-medium text-cream transition hover:bg-navy-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar trámite y precio"}
        </button>
      </div>
    </form>
  );
}
