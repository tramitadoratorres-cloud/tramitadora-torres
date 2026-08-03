"use client";

import { useActionState } from "react";
import { crearPagoAction, type CheckoutFormState } from "./actions";

const initialState: CheckoutFormState = {};

export function CheckoutForm({ tramiteId }: { tramiteId: string }) {
  const action = crearPagoAction.bind(null, tramiteId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Nombre completo
        </label>
        <input
          name="nombre"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          WhatsApp / Teléfono
        </label>
        <input
          name="telefono"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Correo (para tu comprobante de pago)
        </label>
        <input
          name="email"
          type="email"
          required
          className="rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
        />
      </div>

      {state.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-gold px-5 py-3 font-mono text-sm font-semibold text-navy-900 transition hover:bg-gold-bright disabled:opacity-60"
      >
        {pending ? "Redirigiendo a Stripe…" : "Continuar al pago"}
      </button>
      <p className="text-center text-xs text-ink/45">
        Pagas con tarjeta o en efectivo en OXXO a través de Stripe.
      </p>
    </form>
  );
}
