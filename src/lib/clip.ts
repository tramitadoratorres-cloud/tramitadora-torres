import "server-only";

type ClipCheckout = {
  payment_request_id?: string;
  id?: string;
  payment_request_url?: string;
};

function clipAuthorization() {
  const apiKey = process.env.CLIP_API_KEY;
  const secretKey = process.env.CLIP_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error("El pago con Clip todavía no está configurado.");
  }
  return `Basic ${Buffer.from(`${apiKey}:${secretKey}`).toString("base64")}`;
}

async function clipRequest(path: string, init?: RequestInit) {
  const response = await fetch(`https://api.payclip.com${path}`, {
    ...init,
    headers: {
      Authorization: clipAuthorization(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message ?? "No fue posible iniciar el pago con Clip.");
  }
  return data as ClipCheckout & Record<string, unknown>;
}

export async function crearCheckoutClip(input: {
  casoId: string;
  monto: number;
  descripcion: string;
  successUrl: string;
  errorUrl: string;
  webhookUrl: string;
}) {
  const checkout = await clipRequest("/v2/checkout", {
    method: "POST",
    body: JSON.stringify({
      amount: input.monto,
      currency: "MXN",
      purchase_description: input.descripcion.slice(0, 250),
      redirection_url: {
        success: input.successUrl,
        error: input.errorUrl,
        default: input.successUrl,
      },
      metadata: { casoId: input.casoId },
      webhook_url: input.webhookUrl,
      custom_payment_options: { payment_method_types: ["debit", "credit"] },
    }),
  });

  const id = checkout.payment_request_id ?? checkout.id;
  if (!id || !checkout.payment_request_url) {
    throw new Error("Clip no devolvió un enlace de pago válido.");
  }
  return { id, url: checkout.payment_request_url };
}

export async function consultarCheckoutClip(id: string) {
  return clipRequest(`/v2/checkout/${encodeURIComponent(id)}`);
}

export function checkoutClipEstaPagado(checkout: Record<string, unknown>) {
  const values = [
    checkout.status,
    checkout.payment_status,
    (checkout.payment as Record<string, unknown> | undefined)?.status,
  ]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toUpperCase());
  return values.some((status) => ["PAID", "APPROVED", "COMPLETED", "SUCCEEDED"].includes(status));
}
