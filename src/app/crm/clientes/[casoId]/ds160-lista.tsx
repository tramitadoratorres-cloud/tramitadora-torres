"use client";

import { useTransition } from "react";
import {
  crearFormularioDS160Action,
  eliminarFormularioDS160Action,
} from "@/app/forma-ds160/[token]/actions";
import { LinkCliente } from "./link-cliente";
import { DS160Resumen } from "./ds160-resumen";

interface FormularioItem {
  id: string;
  token: string;
  datosJson: string;
}

export function DS160Lista({
  casoId,
  telefono,
  siteUrl,
  formularios,
}: {
  casoId: string;
  telefono: string;
  siteUrl: string;
  formularios: FormularioItem[];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-5">
      {formularios.length === 0 && (
        <p className="text-sm text-ink/50">
          Todavía no hay cuestionarios para este caso. Si el trámite es de
          varias personas (ej. toda una familia), agrega uno por cada quien.
        </p>
      )}
      {formularios.map((f, i) => {
        const datos: Record<string, string> = JSON.parse(f.datosJson);
        const etiqueta = datos.nombreCompleto || `Cuestionario ${i + 1}`;
        const url = `${siteUrl}/forma-ds160/${f.token}`;
        return (
          <div key={f.id} className="rounded border border-ink/10 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-serif font-semibold text-ink">{etiqueta}</p>
              <form action={eliminarFormularioDS160Action.bind(null, f.id, casoId)}>
                <button
                  type="submit"
                  className="font-mono text-xs text-ink/40 hover:text-red-700"
                >
                  Eliminar
                </button>
              </form>
            </div>
            <LinkCliente
              casoId={casoId}
              url={url}
              clienteNombre={etiqueta}
              telefono={telefono}
              mensaje={`Hola, aquí puedes llenar tu forma DS-160 (no es necesario terminarla de una vez, puedes guardar e ir completando): ${url}`}
              mostrarRegenerar={false}
            />
            <div className="mt-4 border-t border-ink/10 pt-3">
              <DS160Resumen datos={datos} />
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => crearFormularioDS160Action(casoId))}
        className="self-start rounded border border-dashed border-ink/25 px-4 py-2 font-mono text-xs text-ink/60 hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
      >
        {isPending ? "Agregando…" : "+ Agregar cuestionario DS-160"}
      </button>
    </div>
  );
}
