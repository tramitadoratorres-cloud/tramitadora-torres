import type { Instrumentation } from "next";

// Corre una sola vez cuando arranca el servidor. Aquí programamos el
// respaldo diario de la base de datos (ver src/lib/backup.ts) para que no
// dependa de que alguien visite el CRM ese día.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { respaldarBaseDeDatos } = await import("@/lib/backup");

  const intentarRespaldo = () => {
    try {
      respaldarBaseDeDatos();
    } catch (e) {
      console.error("No se pudo generar el respaldo diario:", e);
    }
  };

  intentarRespaldo();
  setInterval(intentarRespaldo, 60 * 60 * 1000);
}

// Captura errores de servidor (Server Components, Route Handlers, Server
// Actions) y los guarda para poder revisarlos en /crm/errores.
export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context
) => {
  const { registrarError } = await import("@/lib/error-log");

  await registrarError({
    mensaje: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    ruta: `${context.routePath} (${context.routeType})`,
    metodo: request.method,
  });
};
