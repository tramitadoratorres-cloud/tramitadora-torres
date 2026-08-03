import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO } from "@/lib/constants";
import { getStripeClient, verificarFirmaWebhook } from "@/lib/stripe";
import { avanzarEtapaSiAplica, generarReciboSiFalta } from "@/lib/recibo-helper";

// Stripe llama este webhook cuando cambia el estado de una sesión de pago.
// checkout.session.completed llega de inmediato para tarjeta; para OXXO
// (pago diferido) llega primero con payment_status "unpaid" y después,
// cuando el cliente paga en tienda, llega checkout.session.async_payment_succeeded.
export async function POST(request: Request) {
  const payload = await request.text();
  const firma = request.headers.get("stripe-signature");

  if (!firma) {
    return NextResponse.json({ error: "Falta firma" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verificarFirmaWebhook(payload, firma);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ recibido: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return NextResponse.json({ recibido: true });
  }

  const casoId = session.client_reference_id ?? session.metadata?.casoId;
  if (!casoId) {
    return NextResponse.json({ recibido: true });
  }

  const caso = await db.caso.findUnique({ where: { id: casoId } });
  if (!caso || caso.pagado) {
    return NextResponse.json({ recibido: true });
  }

  let metodo: string | null = null;
  if (typeof session.payment_intent === "string") {
    try {
      const stripe = getStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent,
        { expand: ["payment_method"] }
      );
      const pm = paymentIntent.payment_method;
      metodo = pm && typeof pm !== "string" ? pm.type : null;
    } catch {
      metodo = null;
    }
  }

  await db.caso.update({
    where: { id: casoId },
    data: {
      pagado: true,
      fechaPago: new Date(),
      pagoId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id,
      pagoMetodo: metodo,
    },
  });

  await logActividad({
    casoId,
    userId: null,
    tipo: ACTIVIDAD_TIPO.PAGO_RECIBIDO,
    descripcion: `Pago en línea confirmado vía Stripe (${metodo ?? "método no especificado"})`,
  });

  await avanzarEtapaSiAplica(casoId);
  await generarReciboSiFalta(casoId, null);

  return NextResponse.json({ recibido: true });
}
