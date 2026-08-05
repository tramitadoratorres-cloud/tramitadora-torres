"use client";

import { useTransition } from "react";
import { reactivarCasoAction } from "../actions";

export function ReactivarButton({ casoId }: { casoId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => reactivarCasoAction(casoId))}
      className="rounded border border-ink/15 px-3 py-1.5 font-mono text-xs transition hover:border-navy-700 disabled:opacity-60"
    >
      {isPending ? "Regresando…" : "Regresar al tablero"}
    </button>
  );
}
