import "server-only";
import { db } from "@/lib/db";
import { ACTIVIDAD_VISIBLE_CLIENTE_DEFAULT, type ActividadTipo } from "@/lib/constants";

export async function logActividad(params: {
  casoId: string;
  userId?: string | null;
  tipo: ActividadTipo;
  descripcion: string;
  visibleCliente?: boolean;
}) {
  return db.actividadLog.create({
    data: {
      casoId: params.casoId,
      userId: params.userId ?? null,
      tipo: params.tipo,
      descripcion: params.descripcion,
      visibleCliente:
        params.visibleCliente ?? ACTIVIDAD_VISIBLE_CLIENTE_DEFAULT[params.tipo],
    },
  });
}
