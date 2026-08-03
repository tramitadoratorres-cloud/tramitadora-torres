import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO } from "@/lib/constants";
import { obtenerPago } from "@/lib/mercadopago";
import { avanzarEtapaSiAplica, generarReciboSiFalta } from "@/lib/recibo-helper";

// Mercado Pago llama esta URL (webhook/IPN) cuando el estado de un pago
// cambia. Puede llegar como GET o POST, y el id del pago puede venir como
// `data.id` (formato nuevo) o `id` (IPN clásico).
async function procesarNotificacion(request: Request) {
  const url = new URL(request.url);
  const tipo = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo !== "payment" || !paymentId) {
    return NextResponse.json({ recibido: true });
  }

  let pago;
  try {
    pago = await obtenerPago(paymentId);
  } catch {
    // Mercado Pago reintenta si respondemos distinto de 2xx; devolvemos 200
    // igual para no generar reintentos infinitos si el pago ya no existe.
    return NextResponse.json({ recibido: true });
  }

  const casoId = pago.external_reference;
  if (!casoId || pago.status !== "approved") {
    return NextResponse.json({ recibido: true });
  }

  const caso = await db.caso.findUnique({ where: { id: casoId } });
  if (!caso || caso.pagado) {
    return NextResponse.json({ recibido: true });
  }

  await db.caso.update({
    where: { id: casoId },
    data: {
      pagado: true,
      fechaPago: new Date(),
      pagoId: String(pago.id),
      pagoMetodo: pago.payment_type_id ?? null,
    },
  });

  await logActividad({
    casoId,
    userId: null,
    tipo: ACTIVIDAD_TIPO.PAGO_RECIBIDO,
    descripcion: `Pago en línea confirmado vía Mercado Pago (${pago.payment_type_id ?? "método no especificado"})`,
  });

  await avanzarEtapaSiAplica(casoId);
  await generarReciboSiFalta(casoId, null);

  return NextResponse.json({ recibido: true });
}

export async function POST(request: Request) {
  return procesarNotificacion(request);
}

export async function GET(request: Request) {
  return procesarNotificacion(request);
}
