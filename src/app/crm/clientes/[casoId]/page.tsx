import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ACTIVIDAD_LABEL, formatMXN, type Etapa } from "@/lib/constants";
import { marcarDocumentosAction, marcarPagoAction } from "./actions";
import { TramiteForm } from "./tramite-form";
import { NotaForm } from "./nota-form";
import { EtapaSelector } from "./etapa-selector";
import { GenerarReciboButton } from "./recibo-button";

export default async function ClienteCasoPage({
  params,
}: {
  params: Promise<{ casoId: string }>;
}) {
  const { casoId } = await params;

  const caso = await db.caso.findUnique({
    where: { id: casoId },
    include: {
      cliente: true,
      tramiteCatalogo: true,
      recibos: { orderBy: { createdAt: "desc" } },
      actividades: {
        orderBy: { createdAt: "desc" },
        include: { usuario: true },
      },
    },
  });

  if (!caso) notFound();

  const tramites = await db.tramiteCatalogo.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  const puedeGenerarRecibo = caso.pagado && caso.precioCobrado != null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
                Cliente
              </p>
              <h1 className="mt-1 font-serif text-2xl font-semibold text-ink">
                {caso.cliente.nombre}
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                {caso.cliente.telefono}
                {caso.cliente.email ? ` · ${caso.cliente.email}` : ""}
              </p>
            </div>
            <EtapaSelector casoId={caso.id} etapaActual={caso.etapa as Etapa} />
          </div>

          {caso.mensaje && (
            <p className="mt-4 rounded bg-ink/5 p-3 text-sm text-ink/70">
              <span className="font-medium text-ink">Mensaje inicial: </span>
              {caso.mensaje}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
            Trámite y honorario
          </h2>
          <TramiteForm
            casoId={caso.id}
            tramites={tramites}
            tramiteActualId={caso.tramiteCatalogoId}
            precioActual={caso.precioCobrado}
            motivoActual={caso.motivoAjuste}
          />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
            Documentos, pago y recibo
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <form action={marcarDocumentosAction.bind(null, caso.id)}>
              <button
                type="submit"
                disabled={caso.documentosRecibidos}
                className="rounded border border-ink/15 px-3 py-2 font-mono text-xs disabled:cursor-default disabled:border-transparent disabled:bg-gold/20 disabled:text-navy-800"
              >
                {caso.documentosRecibidos
                  ? "✓ Documentos recibidos"
                  : "Marcar documentos recibidos"}
              </button>
            </form>
            <form action={marcarPagoAction.bind(null, caso.id)}>
              <button
                type="submit"
                disabled={caso.pagado}
                className="rounded border border-ink/15 px-3 py-2 font-mono text-xs disabled:cursor-default disabled:border-transparent disabled:bg-gold/20 disabled:text-navy-800"
              >
                {caso.pagado ? "✓ Pago recibido" : "Marcar pago recibido"}
              </button>
            </form>
          </div>

          <div className="mt-4 border-t border-ink/10 pt-4">
            {caso.recibos.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {caso.recibos.map((recibo) => (
                  <li key={recibo.id} className="flex items-center justify-between text-sm">
                    <span>
                      Recibo{" "}
                      <span className="font-mono">
                        #{String(recibo.folio).padStart(5, "0")}
                      </span>{" "}
                      · {formatMXN(recibo.monto)}
                    </span>
                    <a
                      href={`/api/recibos/${recibo.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-navy-700 underline hover:text-gold-bright"
                    >
                      Descargar PDF
                    </a>
                  </li>
                ))}
              </ul>
            ) : puedeGenerarRecibo ? (
              <GenerarReciboButton casoId={caso.id} />
            ) : (
              <p className="text-sm text-ink/50">
                El recibo se genera automáticamente en cuanto el pago quede
                marcado como recibido (los documentos son independientes y
                pueden llegar antes, después o junto con el pago).
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
            Agregar nota
          </h2>
          <NotaForm casoId={caso.id} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">
            Bitácora de actividad
          </h2>
          <ol className="flex flex-col gap-4">
            {caso.actividades.map((act) => (
              <li key={act.id} className="border-l-2 border-gold/40 pl-3">
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
                  {ACTIVIDAD_LABEL[act.tipo as keyof typeof ACTIVIDAD_LABEL] ?? act.tipo} ·{" "}
                  {new Intl.DateTimeFormat("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(act.createdAt)}
                </p>
                <p className="mt-0.5 text-sm text-ink/80">{act.descripcion}</p>
                {act.usuario && (
                  <p className="mt-0.5 text-xs text-ink/40">
                    {act.usuario.nombre}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/crm"
          className="text-center text-sm text-ink/50 hover:text-navy-700"
        >
          ← Volver al tablero
        </Link>
      </div>
    </div>
  );
}
