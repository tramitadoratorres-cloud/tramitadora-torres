"use client";

import { useState, useTransition } from "react";
import { ETAPAS, ETAPA_LABEL, type Etapa } from "@/lib/constants";
import { moverEtapaAction } from "@/app/crm/actions";
import { AvisoEtapaToast, type AvisoEtapaInfo } from "@/app/crm/aviso-etapa";

export function EtapaSelector({
  casoId,
  etapaActual,
  telefono,
  nombre,
  tramite,
  ticketUrl,
}: {
  casoId: string;
  etapaActual: Etapa;
  telefono: string;
  nombre: string;
  tramite: string;
  ticketUrl: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [aviso, setAviso] = useState<AvisoEtapaInfo | null>(null);

  return (
    <>
      <select
        key={etapaActual}
        defaultValue={etapaActual}
        disabled={isPending}
        onChange={(e) => {
          const nueva = e.target.value as Etapa;
          if (nueva === etapaActual) return;

          startTransition(() => {
            moverEtapaAction(casoId, nueva);
          });
          setAviso({ telefono, nombre, tramite, etapa: nueva, ticketUrl });
        }}
        className="rounded border border-ink/15 bg-white px-3 py-2 font-mono text-xs text-ink disabled:opacity-60"
      >
        {ETAPAS.map((etapa) => (
          <option key={etapa} value={etapa}>
            {ETAPA_LABEL[etapa]}
          </option>
        ))}
      </select>
      {aviso && <AvisoEtapaToast aviso={aviso} onClose={() => setAviso(null)} />}
    </>
  );
}
