import "server-only";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, HORAS_AUTOARCHIVO } from "@/lib/constants";

/**
 * Archiva automáticamente los casos que llevan más de HORAS_AUTOARCHIVO en
 * la etapa ENTREGADO. Se llama en cada carga del CRM (ver crm/layout.tsx)
 * en vez de depender de un cron — el tráfico normal del equipo es suficiente
 * para mantenerlo al día.
 */
export async function archivarEntregadosVencidos() {
  const corte = new Date(Date.now() - HORAS_AUTOARCHIVO * 60 * 60 * 1000);

  const vencidos = await db.caso.findMany({
    where: {
      etapa: "ENTREGADO",
      archivadoEn: null,
      entregadoEn: { lte: corte },
    },
    select: { id: true },
  });

  if (vencidos.length === 0) return;

  const ahora = new Date();
  await db.caso.updateMany({
    where: { id: { in: vencidos.map((c) => c.id) } },
    data: { archivadoEn: ahora },
  });

  for (const { id } of vencidos) {
    await logActividad({
      casoId: id,
      tipo: ACTIVIDAD_TIPO.ARCHIVADO,
      descripcion: `Archivado automáticamente tras ${HORAS_AUTOARCHIVO} h en Entregado / Cerrado`,
    });
  }
}
