"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, ETAPA_LABEL, ETAPAS, type Etapa } from "@/lib/constants";

export async function moverEtapaAction(casoId: string, nuevaEtapa: Etapa) {
  const session = await requireAgent();

  if (!ETAPAS.includes(nuevaEtapa)) {
    throw new Error("Etapa inválida");
  }

  const caso = await db.caso.findUniqueOrThrow({ where: { id: casoId } });
  if (caso.etapa === nuevaEtapa) return;

  await db.caso.update({
    where: { id: casoId },
    data: {
      etapa: nuevaEtapa,
      // Arranca (o reinicia) el reloj de las 48 h para el autoarchivo;
      // se limpia si el caso se mueve fuera de ENTREGADO por error.
      entregadoEn: nuevaEtapa === "ENTREGADO" ? new Date() : null,
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.CAMBIO_ETAPA,
    descripcion: `${session.nombre} movió el caso de "${ETAPA_LABEL[caso.etapa as Etapa]}" a "${ETAPA_LABEL[nuevaEtapa]}"`,
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/clientes/${casoId}`);
}

/** Saca el caso del tablero sin borrarlo: se conserva y sigue siendo
 * localizable desde /crm/buscar. */
export async function archivarCasoAction(casoId: string) {
  const session = await requireAgent();

  await db.caso.update({
    where: { id: casoId },
    data: { archivadoEn: new Date() },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.ARCHIVADO,
    descripcion: `${session.nombre} archivó el caso manualmente`,
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath("/crm/buscar");
}

export async function reactivarCasoAction(casoId: string) {
  const session = await requireAgent();

  const caso = await db.caso.findUniqueOrThrow({ where: { id: casoId } });

  await db.caso.update({
    where: { id: casoId },
    data: {
      archivadoEn: null,
      // Si sigue en ENTREGADO, reinicia el reloj de las 48 h en vez de
      // dejarlo sin fecha (nunca se volvería a archivar solo).
      entregadoEn: caso.etapa === "ENTREGADO" ? new Date() : null,
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.REACTIVADO,
    descripcion: `${session.nombre} regresó el caso al tablero`,
  });

  revalidatePath("/crm");
  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath("/crm/buscar");
}
