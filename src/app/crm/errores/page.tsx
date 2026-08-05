import { db } from "@/lib/db";
import { formatFechaHora } from "@/lib/tiempo";

export default async function ErroresPage() {
  const errores = await db.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Errores del servidor
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Los últimos {errores.length} errores capturados automáticamente. Solo
        se guardan los más recientes (máx. 500).
      </p>

      {errores.length === 0 && (
        <p className="text-sm text-ink/50">Sin errores registrados.</p>
      )}

      <ul className="flex flex-col gap-3">
        {errores.map((error) => (
          <li key={error.id} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm text-red-700">{error.mensaje}</p>
              <span className="shrink-0 font-mono text-[10px] text-ink/40">
                {formatFechaHora(error.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            {(error.ruta || error.metodo) && (
              <p className="mt-1 font-mono text-xs text-ink/50">
                {error.metodo} {error.ruta}
              </p>
            )}
            {error.stack && (
              <details className="mt-2">
                <summary className="cursor-pointer font-mono text-xs text-ink/40 hover:text-ink/70">
                  Ver detalle
                </summary>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-ink/5 p-3 font-mono text-[11px] text-ink/70">
                  {error.stack}
                </pre>
              </details>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
