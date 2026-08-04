"use client";

import { useActionState, useState } from "react";
import type { db } from "@/lib/db";
import { actualizarTramiteAction, alternarActivoAction, type FormState } from "./actions";
import { TramiteIcon, TRAMITE_ICONO_OPCIONES } from "@/components/tramite-icons";

type Tramite = Awaited<ReturnType<typeof db.tramiteCatalogo.findMany>>[number];

const initialState: FormState = {};

export function TramiteRow({ tramite }: { tramite: Tramite }) {
  const [editando, setEditando] = useState(false);
  const [icono, setIcono] = useState(tramite.icono);
  const action = actualizarTramiteAction.bind(null, tramite.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900/5 text-navy-800">
            <TramiteIcon icono={tramite.icono} className="h-6 w-6" />
          </span>
          <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-ink">
              {tramite.nombre}
            </h3>
            {!tramite.activo && (
              <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/50">
                Inactivo
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-ink/60">{tramite.descripcion}</p>
          <p className="mt-2 font-mono text-sm text-navy-700">
            Honorario base: ${tramite.honorarioBase} MXN
          </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs hover:border-navy-700"
          >
            {editando ? "Cerrar" : "Editar"}
          </button>
          <form action={alternarActivoAction.bind(null, tramite.id)}>
            <button
              type="submit"
              className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs hover:border-navy-700"
            >
              {tramite.activo ? "Desactivar" : "Activar"}
            </button>
          </form>
        </div>
      </div>

      {editando && (
        <form action={formAction} className="mt-5 flex flex-col gap-3 border-t border-ink/10 pt-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Nombre
              </label>
              <input
                name="nombre"
                defaultValue={tramite.nombre}
                required
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Honorario base (MXN)
              </label>
              <input
                type="number"
                name="honorarioBase"
                defaultValue={tramite.honorarioBase}
                min={0}
                required
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Descripción corta
            </label>
            <input
              name="descripcion"
              defaultValue={tramite.descripcion}
              className="rounded border border-ink/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Etiqueta (badge)
              </label>
              <input
                name="badge"
                defaultValue={tramite.badge}
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                name="destacado"
                defaultChecked={tramite.destacado}
              />
              Destacar en el sitio
            </label>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Ilustración
              </label>
              <select
                name="icono"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              >
                {TRAMITE_ICONO_OPCIONES.map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-900/5 text-navy-800">
              <TramiteIcon icono={icono} className="h-6 w-6" />
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Requisitos (uno por línea)
            </label>
            <textarea
              name="requisitos"
              rows={4}
              defaultValue={tramite.requisitos}
              className="rounded border border-ink/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Link de pago (Stripe Payment Link)
            </label>
            <input
              type="url"
              name="linkPago"
              placeholder="https://buy.stripe.com/..."
              defaultValue={tramite.linkPago}
              className="rounded border border-ink/15 px-3 py-2 text-sm"
            />
            <p className="text-xs text-ink/45">
              Créalo en tu dashboard de Stripe (Payment Links) con el mismo
              precio que el honorario base y pégalo aquí. Si lo dejas vacío,
              el botón de pago en línea no aparece para este trámite.
            </p>
          </div>

          {state.error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="self-start rounded bg-navy-900 px-4 py-2 font-mono text-xs text-cream hover:bg-navy-700 disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}
