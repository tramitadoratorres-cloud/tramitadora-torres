"use client";

import { useActionState } from "react";
import { SECCIONES_DS160 } from "@/lib/ds160-campos";
import { guardarFormularioDS160Action, type FormularioDS160State } from "./actions";

const initialState: FormularioDS160State = {};

export function DS160Form({
  token,
  datosIniciales,
}: {
  token: string;
  datosIniciales: Record<string, string>;
}) {
  const action = guardarFormularioDS160Action.bind(null, token);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state.ok && (
        <div className="rounded-lg bg-gold/15 px-4 py-3 text-sm text-navy-900">
          ¡Guardado! Puedes seguir editando y volver a guardar cuando quieras.
        </div>
      )}
      {state.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {SECCIONES_DS160.map((seccion) => (
        <fieldset key={seccion.titulo} className="rounded-lg bg-paper p-6 text-ink shadow">
          <legend className="px-1 font-serif text-lg font-semibold text-navy-900">
            {seccion.titulo}
          </legend>
          {seccion.nota && (
            <p className="mb-4 mt-1 text-xs text-ink/50">{seccion.nota}</p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {seccion.campos.map((campo) => {
              const valorInicial = datosIniciales[campo.nombre] ?? "";
              const ancho =
                campo.tipo === "textarea" ? "sm:col-span-2" : "";

              if (campo.tipo === "radio") {
                return (
                  <div key={campo.nombre} className={ancho}>
                    <p className="mb-1.5 text-sm font-medium text-ink/80">
                      {campo.etiqueta}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {campo.opciones?.map((op) => (
                        <label
                          key={op}
                          className="flex items-center gap-1.5 text-sm text-ink/70"
                        >
                          <input
                            type="radio"
                            name={campo.nombre}
                            value={op}
                            defaultChecked={valorInicial === op}
                          />
                          {op}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              if (campo.tipo === "checkbox") {
                return (
                  <label
                    key={campo.nombre}
                    className={`flex items-start gap-2 text-sm text-ink/80 ${ancho} sm:col-span-2`}
                  >
                    <input
                      type="checkbox"
                      name={campo.nombre}
                      value="Sí"
                      defaultChecked={valorInicial === "Sí"}
                      className="mt-0.5"
                    />
                    {campo.etiqueta}
                  </label>
                );
              }

              if (campo.tipo === "textarea") {
                return (
                  <div key={campo.nombre} className={ancho}>
                    <label className="mb-1.5 block text-sm font-medium text-ink/80">
                      {campo.etiqueta}
                    </label>
                    <textarea
                      name={campo.nombre}
                      defaultValue={valorInicial}
                      rows={3}
                      className="w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm"
                    />
                  </div>
                );
              }

              return (
                <div key={campo.nombre} className={ancho}>
                  <label className="mb-1.5 block text-sm font-medium text-ink/80">
                    {campo.etiqueta}
                  </label>
                  <input
                    type={campo.tipo}
                    name={campo.nombre}
                    defaultValue={valorInicial}
                    className="w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm"
                  />
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="sticky bottom-4 self-center rounded bg-gold px-8 py-3 font-mono text-sm font-semibold text-navy-900 shadow-lg transition hover:bg-gold-bright disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar respuestas"}
      </button>
    </form>
  );
}
