import "server-only";
import { db } from "@/lib/db";
import type { ActividadTipo } from "@/lib/constants";

export async function logActividad(params: {
  casoId: string;
  userId?: string | null;
  tipo: ActividadTipo;
  descripcion: string;
}) {
  return db.actividadLog.create({
    data: {
      casoId: params.casoId,
      userId: params.userId ?? null,
      tipo: params.tipo,
      descripcion: params.descripcion,
    },
  });
}
