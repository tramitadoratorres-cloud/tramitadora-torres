"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { agregarTramiteExpedienteAction, type FormState } from "./actions";
import { ETAPA_LABEL, formatMXN, type Etapa } from "@/lib/constants";

interface TramiteOpcion {
  id: string;
  nombre: string;
  honorarioBase: number;
}

interface CasoHermano {
  id: string;
  etapa: string;
  precioCobrado: number | null;
  pagado: boolean;
  paraQuien: string | null;
  tramiteCatalogo: { nombre: string } | null;
}

const initialState: FormState = {};

export function ExpedienteSection({
  casoId,
  clienteNombre,
  tramites,
  hermanos,
}: {
  casoId: string;
  clienteNombre: string;
  tramites: TramiteOpcion[];
  hermanos: CasoHermano[];
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tramiteId, setTramiteId] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const action = agregarTramiteExpedienteAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="flex flex-col gap-4">
      {hermanos.length === 0 ? (
        <p className="text-sm text-ink/50">
          Este contacto todavía no tiene otros trámites. Si esta persona (o
          alguien de su familia) necesita tramitar algo más, agrégalo aquí
          mismo sin crear un cliente nuevo.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {hermanos.map((h) => (
            <li key={h.id}>
              <Link
                href={`/crm/clientes/${h.id}`}
                className="flex items-center justify-between gap-3 rounded border border-ink/10 p-3 text-sm hover:border-navy-700"
              >
                <div>
                  <p className="font-medium text-ink">
                    {h.tramiteCatalogo?.nombre ?? "Sin trámite asignado"}
                  </p>
                  <p className="text-xs text-ink/50">
                    Para: {h.paraQuien || clienteNombre} ·{" "}
                    {ETAPA_LABEL[h.etapa as Etapa] ?? h.etapa}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-xs text-navy-700">
                    {h.precioCobrado != null ? formatMXN(h.precioCobrado) : "—"}
                  </span>
                  {h.pagado && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[10px] text-navy-800">
                      Pagado
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {mostrarForm ? (
        <form action={formAction} className="flex flex-col gap-3 rounded border border-ink/10 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Trámite
              </label>
              <select
                name="tramiteCatalogoId"
                required
                value={tramiteId}
                onChange={(e) => {
                  const id = e.target.value;
                  setTramiteId(id);
                  const t = tramites.find((t) => t.id === id);
                  if (t) setPrecio(t.honorarioBase);
                }}
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              >
                <option value="">Selecciona un trámite</option>
                {tramites.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} — honorario base {formatMXN(t.honorarioBase)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Precio cobrado (MXN)
              </label>
              <input
                type="number"
                name="precioCobrado"
                required
                min={0}
                value={precio}
                onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                className="rounded border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              ¿Para quién es? (opcional)
            </label>
            <input
              name="paraQuien"
              placeholder={`Déjalo vacío si es para ${clienteNombre}`}
              className="rounded border border-ink/15 px-3 py-2 text-sm"
            />
          </div>

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
              {pending ? "Agregando…" : "Agregar al expediente"}
            </button>
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              className="rounded border border-ink/15 px-4 py-2 font-mono text-xs"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setMostrarForm(true)}
          className="self-start rounded border border-dashed border-ink/25 px-4 py-2 font-mono text-xs text-ink/60 hover:border-navy-700 hover:text-navy-700"
        >
          + Agregar otro trámite a este expediente
        </button>
      )}
    </div>
  );
}
