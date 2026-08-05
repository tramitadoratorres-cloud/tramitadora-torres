import "server-only";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import {
  ACTIVIDAD_TIPO,
  ETAPA_LABEL,
  FOLIO_INICIAL,
  formatFolio,
  formatMXN,
  type Etapa,
} from "@/lib/constants";

// Cuando el pago o los documentos quedan listos, el caso avanza de etapa
// automáticamente (basta con que UNA de las dos casillas se complete: el pago
// en línea llega antes que los documentos, el flujo manual puede llegar junto
// o documentos primero).
export async function avanzarEtapaSiAplica(casoId: string) {
  const caso = await db.caso.findUniqueOrThrow({ where: { id: casoId } });
  if (
    (caso.documentosRecibidos || caso.pagado) &&
    (caso.etapa === "NUEVO_CONTACTO" || caso.etapa === "COTIZADO")
  ) {
    await db.caso.update({
      where: { id: casoId },
      data: { etapa: "DOCUMENTOS_PAGO" as Etapa },
    });
    await logActividad({
      casoId,
      userId: null,
      tipo: ACTIVIDAD_TIPO.CAMBIO_ETAPA,
      descripcion: `Caso avanzado automáticamente a "${ETAPA_LABEL.DOCUMENTOS_PAGO}"`,
    });
  }
}

// Genera el recibo del honorario en cuanto hay pago confirmado y un precio
// asignado, si todavía no existe uno para este caso. Se usa tanto desde el
// CRM (pago manual) como desde el webhook de Mercado Pago (pago en línea).
export async function generarReciboSiFalta(
  casoId: string,
  userId: string | null
) {
  const caso = await db.caso.findUniqueOrThrow({
    where: { id: casoId },
    include: { recibos: true },
  });

  if (!caso.pagado || caso.precioCobrado == null || caso.recibos.length > 0) {
    return caso.recibos[0] ?? null;
  }

  const ultimo = await db.recibo.aggregate({ _max: { folio: true } });
  const folio = Math.max((ultimo._max.folio ?? 0) + 1, FOLIO_INICIAL);
  const recibo = await db.recibo.create({
    data: {
      casoId,
      folio,
      monto: caso.precioCobrado,
      motivoAjuste: caso.motivoAjuste,
      generadoPorId: userId,
    },
  });

  await logActividad({
    casoId,
    userId,
    tipo: ACTIVIDAD_TIPO.RECIBO_GENERADO,
    descripcion: userId
      ? `Recibo folio ${formatFolio(recibo.folio)} generado`
      : `Recibo folio ${formatFolio(recibo.folio)} generado automáticamente (pago en línea)`,
  });

  return recibo;
}

// Genera SIEMPRE un recibo nuevo para el caso, sin importar si ya tiene uno.
// Para cobros aparte del honorario base del trámite (ej. una comisión por
// pagar la visa en línea a nombre del cliente) — el trámite puede terminar
// con varios recibos, cada uno con su propio folio y concepto.
export async function crearReciboAdicional(
  casoId: string,
  monto: number,
  concepto: string,
  userId: string | null
) {
  const ultimo = await db.recibo.aggregate({ _max: { folio: true } });
  const folio = Math.max((ultimo._max.folio ?? 0) + 1, FOLIO_INICIAL);
  const recibo = await db.recibo.create({
    data: {
      casoId,
      folio,
      monto,
      motivoAjuste: concepto,
      generadoPorId: userId,
    },
  });

  await logActividad({
    casoId,
    userId,
    tipo: ACTIVIDAD_TIPO.RECIBO_GENERADO,
    descripcion: `Recibo adicional folio ${formatFolio(recibo.folio)} generado (${concepto}, ${formatMXN(monto)})`,
  });

  return recibo;
}
