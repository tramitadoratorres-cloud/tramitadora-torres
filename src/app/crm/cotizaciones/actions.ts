"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { ACTIVIDAD_TIPO, ORIGEN } from "@/lib/constants";
import { COTIZADOR_TRAMITES } from "@/lib/cotizador";

export async function convertirCotizacionAction(formData: FormData) {
  const session = await requireAgent();
  const cotizacionId = String(formData.get("cotizacionId") ?? "");
  const quote = await db.cotizacion.findUnique({ where: { id: cotizacionId } });
  if (!quote || quote.convertidaEn) return;

  const tramite = COTIZADOR_TRAMITES.find((item) => item.id === quote.tipo)?.nombre ?? "Trámite cotizado";
  const personas = quote.adultos + quote.menores;
  await db.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({
      data: { nombre: quote.nombre, telefono: quote.telefono, email: quote.email },
    });
    const expediente = await tx.expediente.create({ data: { clienteId: cliente.id } });
    const caso = await tx.caso.create({
      data: {
        clienteId: cliente.id,
        expedienteId: expediente.id,
        paraQuien: personas > 1 ? `Grupo familiar · ${personas} personas` : undefined,
        etapa: "COTIZADO",
        precioCobrado: quote.honorariosMXN,
        origen: ORIGEN.WEB,
        mensaje: `Creado desde la cotización ${quote.token.slice(-8).toUpperCase()}: ${tramite}.`,
      },
    });
    await tx.actividadLog.create({
      data: {
        casoId: caso.id,
        userId: session.userId,
        tipo: ACTIVIDAD_TIPO.CREACION,
        descripcion: `Cotización web convertida a cliente y expediente (${tramite}).`,
      },
    });
    await tx.cotizacion.update({
      where: { id: quote.id },
      data: { clienteId: cliente.id, convertidaEn: new Date() },
    });
  });
  revalidatePath("/crm/cotizaciones");
  revalidatePath("/crm");
}
