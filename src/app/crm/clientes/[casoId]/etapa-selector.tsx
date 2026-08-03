"use client";

import { useTransition } from "react";
import { ETAPAS, ETAPA_LABEL, type Etapa } from "@/lib/constants";
import { moverEtapaAction } from "@/app/crm/actions";

export function EtapaSelector({
  casoId,
  etapaActual,
}: {
  casoId: string;
  etapaActual: Etapa;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      key={etapaActual}
      defaultValue={etapaActual}
      disabled={isPending}
      onChange={(e) => {
        const nueva = e.target.value as Etapa;
        startTransition(() => {
          moverEtapaAction(casoId, nueva);
        });
      }}
      className="rounded border border-ink/15 bg-white px-3 py-2 font-mono text-xs text-ink disabled:opacity-60"
    >
      {ETAPAS.map((etapa) => (
        <option key={etapa} value={etapa}>
          {ETAPA_LABEL[etapa]}
        </option>
      ))}
    </select>
  );
}
