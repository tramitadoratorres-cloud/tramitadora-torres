"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  generarReciboAdicionalAction,
  type CobroAdicionalState,
} from "./actions";

const initialState: CobroAdicionalState = {};

export function CobroAdicionalForm({ casoId }: { casoId: string }) {
  const action = generarReciboAdicionalAction.bind(null, casoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.reciboId) {
      window.open(`/api/recibos/${state.reciboId}`, "_blank");
      formRef.current?.reset();
    }
  }, [state.reciboId]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4"
    >
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
        Cobro adicional (ej. comisión, cargo extra) — genera su propio recibo
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <input
          name="concepto"
          placeholder="Concepto, ej. Comisión por pago de visa en línea"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
        <input
          name="monto"
          type="number"
          min={1}
          step={1}
          placeholder="Monto MXN"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink sm:w-32"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded border border-ink/15 px-4 py-2 font-mono text-xs transition hover:border-navy-700 hover:text-navy-700 disabled:opacity-60"
      >
        {pending ? "Generando…" : "Generar recibo adicional"}
      </button>
    </form>
  );
}
