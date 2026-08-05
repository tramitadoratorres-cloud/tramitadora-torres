import Link from "next/link";
import { db } from "@/lib/db";
import { formatFolio, formatMXN } from "@/lib/constants";
import {
  formatFechaHora,
  hoyTijuana,
  inicioMesTijuana,
  inicioSemanaTijuana,
  parseFechaHoraLocal,
  sumarDiasISO,
} from "@/lib/tiempo";

function hrefRango(desde: string, hasta: string) {
  return `/crm/reportes?desde=${desde}&hasta=${hasta}`;
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  const hoy = hoyTijuana();
  const desde = params.desde || inicioMesTijuana();
  const hasta = params.hasta || hoy;

  const inicio = parseFechaHoraLocal(`${desde}T00:00`);
  const finExclusivo = parseFechaHoraLocal(`${sumarDiasISO(hasta, 1)}T00:00`);

  const recibos = await db.recibo.findMany({
    where: { createdAt: { gte: inicio, lt: finExclusivo } },
    include: {
      caso: { include: { cliente: true, tramiteCatalogo: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = recibos.reduce((suma, r) => suma + r.monto, 0);

  const presets = [
    { label: "Hoy", desde: hoy, hasta: hoy },
    { label: "Esta semana", desde: inicioSemanaTijuana(), hasta: hoy },
    { label: "Este mes", desde: inicioMesTijuana(), hasta: hoy },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Reporte de ingresos
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Suma de todos los recibos generados en el rango elegido (incluye
        cobros adicionales, no solo el honorario base de cada trámite).
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <Link
            key={p.label}
            href={hrefRango(p.desde, p.hasta)}
            className={`rounded-full px-3 py-1.5 font-mono text-xs transition ${
              desde === p.desde && hasta === p.hasta
                ? "bg-navy-900 text-cream"
                : "border border-ink/15 text-ink/70 hover:border-navy-700"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <form
        action="/crm/reportes"
        method="GET"
        className="mb-6 flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Desde
          </label>
          <input
            type="date"
            name="desde"
            defaultValue={desde}
            required
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
            Hasta
          </label>
          <input
            type="date"
            name="hasta"
            defaultValue={hasta}
            required
            className="rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
          />
        </div>
        <button
          type="submit"
          className="rounded border border-ink/15 px-4 py-2 font-mono text-xs transition hover:border-navy-700 hover:text-navy-700"
        >
          Filtrar
        </button>
      </form>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Total del periodo
        </p>
        <p className="mt-1 font-serif text-3xl font-bold text-navy-800">
          {formatMXN(total)}
        </p>
        <p className="mt-1 text-xs text-ink/50">
          {recibos.length} {recibos.length === 1 ? "recibo" : "recibos"} · del{" "}
          {formatFechaHora(inicio, { dateStyle: "medium" })} al{" "}
          {formatFechaHora(
            parseFechaHoraLocal(`${hasta}T00:00`),
            { dateStyle: "medium" }
          )}
        </p>
      </div>

      {recibos.length === 0 ? (
        <p className="text-sm text-ink/50">
          No hay recibos generados en este rango.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {recibos.map((recibo) => {
            const caso = recibo.caso;
            const nombre = caso.paraQuien || caso.cliente.nombre;
            const tramite = caso.tramiteCatalogo?.nombre ?? "Sin trámite";
            return (
              <li
                key={recibo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-serif font-semibold text-ink">
                    <Link
                      href={`/crm/clientes/${caso.id}`}
                      className="hover:text-navy-700"
                    >
                      {nombre}
                    </Link>{" "}
                    <span className="font-mono text-xs text-ink/40">
                      {formatFolio(recibo.folio)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60">
                    {tramite}
                    {recibo.motivoAjuste ? ` · ${recibo.motivoAjuste}` : ""} ·{" "}
                    {formatFechaHora(recibo.createdAt, { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-navy-700">
                    {formatMXN(recibo.monto)}
                  </span>
                  <a
                    href={`/api/recibos/${recibo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-navy-700 underline hover:text-gold-bright"
                  >
                    PDF
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
