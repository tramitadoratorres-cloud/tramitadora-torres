import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultarCheckoutClip, checkoutClipEstaPagado } from "@/lib/clip";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO } from "@/lib/constants";
import { avanzarEtapaSiAplica, generarReciboSiFalta } from "@/lib/recibo-helper";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ recibido: true });

  const caso = await db.caso.findFirst({ where: { pagoPreferenciaId: body.id } });
  if (!caso || caso.pagado) return NextResponse.json({ recibido: true });

  try {
    const checkout = await consultarCheckoutClip(body.id);
    if (!checkoutClipEstaPagado(checkout)) return NextResponse.json({ recibido: true });

    await db.caso.update({
      where: { id: caso.id },
      data: { pagado: true, fechaPago: new Date(), pagoId: body.id, pagoMetodo: "clip" },
    });
    await logActividad({
      casoId: caso.id,
      userId: null,
      tipo: ACTIVIDAD_TIPO.PAGO_RECIBIDO,
      descripcion: "Pago en línea confirmado vía Clip",
    });
    await avanzarEtapaSiAplica(caso.id);
    await generarReciboSiFalta(caso.id, null);
  } catch (error) {
    console.error("No se pudo confirmar el pago de Clip", error);
  }
  return NextResponse.json({ recibido: true });
}
