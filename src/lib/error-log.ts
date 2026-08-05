import "server-only";
import { db } from "@/lib/db";

const MAX_ERRORES = 500;

/**
 * Guarda un error de servidor en la base de datos (ver /crm/errores).
 * Nunca debe tumbar la petición que la disparó: cualquier fallo aquí solo
 * se registra en la consola del servidor.
 */
export async function registrarError(params: {
  mensaje: string;
  stack?: string;
  ruta?: string;
  metodo?: string;
}) {
  try {
    await db.errorLog.create({
      data: {
        mensaje: params.mensaje.slice(0, 2000),
        stack: params.stack?.slice(0, 4000) ?? null,
        ruta: params.ruta ?? null,
        metodo: params.metodo ?? null,
      },
    });

    const total = await db.errorLog.count();
    if (total > MAX_ERRORES) {
      const viejos = await db.errorLog.findMany({
        orderBy: { createdAt: "asc" },
        take: total - MAX_ERRORES,
        select: { id: true },
      });
      await db.errorLog.deleteMany({
        where: { id: { in: viejos.map((e) => e.id) } },
      });
    }
  } catch (e) {
    console.error("No se pudo registrar el error:", e);
  }
}
