import Link from "next/link";
import { db } from "@/lib/db";
import { ETAPA_LABEL, formatMXN, type Etapa } from "@/lib/constants";
import { ReactivarButton } from "./reactivar-button";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const casos = query
    ? await db.caso.findMany({
        where: {
          OR: [
            { cliente: { nombre: { contains: query } } },
            { cliente: { telefono: { contains: query } } },
            { paraQuien: { contains: query } },
            { tramiteCatalogo: { nombre: { contains: query } } },
          ],
        },
        include: { cliente: true, tramiteCatalogo: true },
        orderBy: { updatedAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Buscar clientes y trámites
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Incluye los casos que ya salieron del tablero (archivados
        automáticamente 48 h después de Entregado / Cerrado, o sacados a
        mano). Nada se borra de la base de datos.
      </p>

      <form action="/crm/buscar" method="GET" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Nombre, teléfono o trámite…"
          autoFocus
          className="w-full rounded border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink"
        />
      </form>

      {query && casos.length === 0 && (
        <p className="text-sm text-ink/50">
          Sin resultados para &quot;{query}&quot;.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {casos.map((caso) => (
          <li
            key={caso.id}
            className="rounded-lg bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/crm/clientes/${caso.id}`}
                  className="font-serif font-semibold text-ink hover:text-navy-700"
                >
                  {caso.paraQuien || caso.cliente.nombre}
                </Link>
                <p className="mt-0.5 text-xs text-ink/60">
                  {caso.tramiteCatalogo?.nombre ?? "Sin trámite asignado"} ·{" "}
                  {caso.cliente.telefono}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 font-mono text-[10px] text-ink/60">
                    {ETAPA_LABEL[caso.etapa as Etapa]}
                  </span>
                  {caso.archivadoEn && (
                    <span className="rounded-full bg-navy-900/10 px-2 py-0.5 font-mono text-[10px] text-navy-800">
                      Archivado
                    </span>
                  )}
                  {caso.pagado && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[10px] text-navy-800">
                      Pagado
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-navy-700">
                  {caso.precioCobrado != null
                    ? formatMXN(caso.precioCobrado)
                    : "—"}
                </span>
                {caso.archivadoEn && <ReactivarButton casoId={caso.id} />}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
