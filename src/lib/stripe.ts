import "server-only";
import Stripe from "stripe";

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY en .env. Agrega tus credenciales de Stripe (ver README) para activar el pago en línea."
    );
  }
  return new Stripe(secretKey);
}

export function verificarFirmaWebhook(payload: string, firma: string) {
  const stripe = getStripeClient();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Falta STRIPE_WEBHOOK_SECRET en .env.");
  }
  return stripe.webhooks.constructEvent(payload, firma, secret);
}
