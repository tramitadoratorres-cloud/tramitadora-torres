"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { crearCheckoutClip } from "@/lib/clip";

export async function iniciarPagoClipAction(token: string) {
  const caso = await db.caso.findUnique({
    where: { tokenPublico: token },
    include: { cliente: true, tramiteCatalogo: true },
  });
  if (!caso || caso.pagado || caso.precioCobrado == null) return;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const checkout = await crearCheckoutClip({
    casoId: caso.id,
    monto: caso.precioCobrado,
    descripcion: `Tramitadora Torres · ${caso.tramiteCatalogo?.nombre ?? "Honorario de gestoría"}`,
    successUrl: `${siteUrl}/mi-tramite/${token}?pago=clip`,
    errorUrl: `${siteUrl}/mi-tramite/${token}?pago=error`,
    webhookUrl: `${siteUrl}/api/pagos/clip`,
  });

  await db.caso.update({
    where: { id: caso.id },
    data: { pagoPreferenciaId: checkout.id, pagoMetodo: "clip" },
  });
  redirect(checkout.url);
}
