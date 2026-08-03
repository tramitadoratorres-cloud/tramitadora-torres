"use client";

import { useActionState, useRef } from "react";
import { subirArchivoAction, eliminarArchivoAction, type FormState } from "./portal-actions";

const initialState: FormState = {};

interface ArchivoItem {
  id: string;
  nombre: string;
  tamano: number;
  createdAt: Date;
}

export function ArchivosSection({
  casoId,
  archivos,
}: {
  casoId: string;
  archivos: ArchivoItem[];
}) {
  const action = subirArchivoAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {archivos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {archivos.map((archivo) => (
            <li
              key={archivo.id}
              className="flex items-center justify-between gap-3 rounded border border-ink/10 bg-ink/5 px-3 py-2 text-sm"
            >
              <a
                href={`/api/archivos/${archivo.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-navy-700 underline hover:text-gold-bright"
              >
                {archivo.nombre}
              </a>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-ink/40">
                  {(archivo.tamano / 1024).toFixed(0)} KB
                </span>
                <form action={eliminarArchivoAction.bind(null, archivo.id, casoId)}>
                  <button
                    type="submit"
                    className="font-mono text-xs text-ink/40 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
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
        className="flex flex-wrap items-center gap-3"
      >
        <input
          type="file"
          name="archivo"
          required
          className="text-sm text-ink/70 file:mr-3 file:rounded file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:font-mono file:text-xs file:text-cream"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-ink/15 px-3 py-2 font-mono text-xs transition hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Subir archivo"}
        </button>
      </form>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <p className="text-xs text-ink/40">
        El cliente puede ver y descargar estos archivos desde su ticket
        virtual. Máximo 15 MB por archivo.
      </p>
    </div>
  );
}
