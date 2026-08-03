"use client";

import { useState, useTransition } from "react";
import { generarReciboAction } from "./actions";

export function GenerarReciboButton({ casoId }: { casoId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const reciboId = await generarReciboAction(casoId);
              window.open(`/api/recibos/${reciboId}`, "_blank");
            } catch {
              setError("No se pudo generar el recibo. Intenta de nuevo.");
            }
          });
        }}
        className="rounded bg-gold px-4 py-2 font-mono text-xs font-semibold text-navy-900 transition hover:bg-gold-bright disabled:opacity-60"
      >
        {isPending ? "Generando…" : "Generar recibo"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
