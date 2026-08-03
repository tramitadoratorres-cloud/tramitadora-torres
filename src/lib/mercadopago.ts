import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

function getConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Falta MERCADOPAGO_ACCESS_TOKEN en .env. Agrega tus credenciales de Mercado Pago (ver README) para activar el pago en línea."
    );
  }
  return new MercadoPagoConfig({ accessToken });
}

export function mercadoPagoConfigurado() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function crearPreferenciaPago(params: {
  casoId: string;
  tramiteNombre: string;
  monto: number;
  clienteNombre: string;
  clienteEmail?: string;
}) {
  const preference = new Preference(getConfig());

  const base = siteUrl();
  const response = await preference.create({
    body: {
      items: [
        {
          id: params.casoId,
          title: `Honorario de gestoría — ${params.tramiteNombre}`,
          quantity: 1,
          currency_id: "MXN",
          unit_price: params.monto,
        },
      ],
      payer: {
        name: params.clienteNombre,
        email: params.clienteEmail || undefined,
      },
      external_reference: params.casoId,
      notification_url: `${base}/api/pagos/mercadopago`,
      back_urls: {
        success: `${base}/pagar/estado?caso=${params.casoId}`,
        pending: `${base}/pagar/estado?caso=${params.casoId}`,
        failure: `${base}/pagar/estado?caso=${params.casoId}`,
      },
      auto_return: "approved",
      statement_descriptor: "TRAMITADORA TORRES",
    },
  });

  return response;
}

export async function obtenerPago(paymentId: string) {
  const payment = new Payment(getConfig());
  return payment.get({ id: paymentId });
}
