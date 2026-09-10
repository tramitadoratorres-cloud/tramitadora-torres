"use client";

import { useActionState, useEffect, useState } from "react";
import type { db } from "@/lib/db";
import {
  asignarTramiteAction,
  crearTramiteRapidoAction,
  type FormState,
  type CrearTramiteRapidoState,
} from "./actions";

type Tramite = Awaited<ReturnType<typeof db.tramiteCatalogo.findMany>>[number];

const initialState: FormState = {};
const initialNuevoState: CrearTramiteRapidoState = {};
const VALOR_NUEVO = "__nuevo__";

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

  const [tramitesLocal, setTramitesLocal] = useState(tramites);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [nuevoState, nuevoFormAction, nuevoPending] = useActionState(
    crearTramiteRapidoAction,
    initialNuevoState
  );

  const tramiteSeleccionado = tramitesLocal.find((t) => t.id === tramiteId);

  // Sincroniza el trámite recién creado (desde el mini-formulario de abajo)
  // hacia el selector, en cuanto la acción del servidor termina.
  useEffect(() => {
    if (!nuevoState.tramite) return;
    const t = nuevoState.tramite;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTramitesLocal((prev) =>
      prev.some((p) => p.id === t.id)
        ? prev
        : [
            ...prev,
            {
              ...t,
              descripcion: "",
              badge: "",
              requisitos: "",
              icono: "documento",
              destacado: false,
              activo: true,
              orden: prev.length + 1,
              linkPago: "",
            } as Tramite,
          ]
    );
    setTramiteId(t.id);
    setPrecio(String(t.honorarioBase));
    setCreandoNuevo(false);
  }, [nuevoState.tramite]);

  function handleTramiteChange(id: string) {
    if (id === VALOR_NUEVO) {
      setCreandoNuevo(true);
      return;
    }
    setTramiteId(id);
    const tramite = tramitesLocal.find((t) => t.id === id);
    if (tramite && !precioActual) {
      setPrecio(String(tramite.honorarioBase));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {creandoNuevo && (
        <form
          action={nuevoFormAction}
          className="flex flex-col gap-3 rounded border border-dashed border-navy-700/30 bg-navy-900/5 p-4"
        >
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Trámite nuevo para el catálogo
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              name="nombre"
              required
              placeholder="Nombre del trámite"
              className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
            />
            <input
              type="number"
              name="honorarioBase"
              min={0}
              step={1}
              required
              placeholder="Honorario base (MXN)"
              className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
            />
          </div>
          {nuevoState.error && (
            <p className="text-sm text-red-700">{nuevoState.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={nuevoPending}
              className="rounded bg-navy-900 px-4 py-2 font-mono text-xs text-cream transition hover:bg-navy-700 disabled:opacity-60"
            >
              {nuevoPending ? "Creando…" : "Crear y usar este trámite"}
            </button>
            <button
              type="button"
              onClick={() => setCreandoNuevo(false)}
              className="rounded border border-ink/15 px-4 py-2 font-mono text-xs transition hover:border-navy-700"
            >
              Cancelar
            </button>
          </div>
          <p className="text-xs text-ink/40">
            Se agrega al catálogo completo (CRM → Catálogo y sitio público);
            después puedes editarle descripción, requisitos e ícono desde ahí.
          </p>
        </form>
      )}

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
              {tramitesLocal.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — honorario base {t.honorarioBase}
                </option>
              ))}
              <option value={VALOR_NUEVO}>+ Agregar trámite nuevo…</option>
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
    </div>
  );
}
