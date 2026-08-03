import "server-only";
import Stripe from "stripe";

export function stripeConfigurado() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY en .env. Agrega tus credenciales de Stripe (ver README) para activar el pago en línea."
    );
  }
  return new Stripe(secretKey);
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function crearSesionPago(params: {
  casoId: string;
  tramiteNombre: string;
  monto: number;
  clienteEmail: string;
}) {
  const stripe = getStripeClient();
  const base = siteUrl();

  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "oxxo"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "mxn",
          unit_amount: Math.round(params.monto * 100),
          product_data: {
            name: `Honorario de gestoría — ${params.tramiteNombre}`,
          },
        },
      },
    ],
    customer_email: params.clienteEmail,
    client_reference_id: params.casoId,
    metadata: { casoId: params.casoId },
    success_url: `${base}/pagar/estado?caso=${params.casoId}`,
    cancel_url: `${base}/pagar/estado?caso=${params.casoId}&status=rejected`,
  });
}

export function verificarFirmaWebhook(payload: string, firma: string) {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Falta STRIPE_WEBHOOK_SECRET en .env.");
  }
  return stripe.webhooks.constructEvent(payload, firma, secret);
}
