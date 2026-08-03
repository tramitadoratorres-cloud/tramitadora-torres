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
    data: { etapa: nuevaEtapa },
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
