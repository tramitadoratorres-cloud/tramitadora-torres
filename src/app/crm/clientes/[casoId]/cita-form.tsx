"use client";

import { useActionState, useRef, useState } from "react";
import {
  crearCitaAction,
  actualizarCitaAction,
  eliminarCitaAction,
  eliminarArchivoAction,
  subirArchivoCitaAction,
  type FormState,
} from "./portal-actions";
import { formatFechaHora, toDatetimeLocalValue } from "@/lib/tiempo";

const initialState: FormState = {};

interface ArchivoItem {
  id: string;
  nombre: string;
  tamano: number;
}

interface CitaItem {
  id: string;
  fecha: Date;
  lugar: string;
  nota: string;
  archivos: ArchivoItem[];
}

function CitaArchivos({
  casoId,
  citaId,
  archivos,
}: {
  casoId: string;
  citaId: string;
  archivos: ArchivoItem[];
}) {
  const action = subirArchivoCitaAction.bind(null, casoId, citaId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mt-2 border-t border-ink/10 pt-2">
      {archivos.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1">
          {archivos.map((archivo) => (
            <li
              key={archivo.id}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <a
                href={`/api/archivos/${archivo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-700 underline hover:text-gold-bright"
              >
                {archivo.nombre}
              </a>
              <form action={eliminarArchivoAction.bind(null, archivo.id, casoId)}>
                <button
                  type="submit"
                  className="font-mono text-ink/40 hover:text-red-700"
                >
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          type="file"
          name="archivo"
          required
          accept="image/*,.pdf"
          className="text-xs text-ink/60 file:mr-2 file:rounded file:border-0 file:bg-navy-900 file:px-2 file:py-1 file:font-mono file:text-[11px] file:text-cream"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-ink/15 px-2 py-1 font-mono text-[11px] transition hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Adjuntar foto/PDF"}
        </button>
      </form>
      {state.error && (
        <p className="mt-1 text-xs text-red-700">{state.error}</p>
      )}
    </div>
  );
}

function CitaRow({ casoId, cita }: { casoId: string; cita: CitaItem }) {
  const [editando, setEditando] = useState(false);
  const action = actualizarCitaAction.bind(null, cita.id, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (editando) {
    return (
      <li className="rounded border border-ink/10 bg-ink/5 px-3 py-2 text-sm">
        <form
          action={async (formData) => {
            await formAction(formData);
            setEditando(false);
          }}
          className="flex flex-col gap-2"
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="datetime-local"
              name="fecha"
              required
              defaultValue={toDatetimeLocalValue(cita.fecha)}
              className="rounded border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
            <input
              name="lugar"
              defaultValue={cita.lugar}
              placeholder="Lugar (opcional)"
              className="rounded border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
            />
          </div>
          <input
            name="nota"
            defaultValue={cita.nota}
            placeholder="Nota para el cliente (opcional)"
            className="rounded border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
          />
          {state.error && <p className="text-xs text-red-700">{state.error}</p>}
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
      </li>
    );
  }

  return (
    <li className="rounded border border-ink/10 bg-ink/5 px-3 py-2 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink">
            {formatFechaHora(cita.fecha, { dateStyle: "long", timeStyle: "short" })}
          </p>
          {cita.lugar && <p className="text-ink/60">{cita.lugar}</p>}
          {cita.nota && <p className="text-ink/60">{cita.nota}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="font-mono text-xs text-ink/40 hover:text-navy-700"
          >
            Editar
          </button>
          <form action={eliminarCitaAction.bind(null, cita.id, casoId)}>
            <button
              type="submit"
              className="font-mono text-xs text-ink/40 hover:text-red-700"
            >
              Eliminar
            </button>
          </form>
        </div>
      </div>
      <CitaArchivos casoId={casoId} citaId={cita.id} archivos={cita.archivos} />
    </li>
  );
}

export function CitasSection({
  casoId,
  citas,
}: {
  casoId: string;
  citas: CitaItem[];
}) {
  const action = crearCitaAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {citas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {citas.map((cita) => (
            <CitaRow key={cita.id} casoId={casoId} cita={cita} />
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          formRef.current?.reset();
        }}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              name="fecha"
              required
              className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
              Lugar (opcional)
            </label>
            <input
              name="lugar"
              placeholder="Ej. SRE Tijuana, Consulado EE.UU."
              className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
            />
          </div>
        </div>
        <input
          name="nota"
          placeholder="Nota para el cliente (opcional)"
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
        {state.error && <p className="text-sm text-red-700">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded border border-ink/15 px-3 py-2 font-mono text-xs transition hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Agendar cita"}
        </button>
      </form>
    </div>
  );
}
