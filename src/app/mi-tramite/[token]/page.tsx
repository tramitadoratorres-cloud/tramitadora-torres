import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  DATOS_PAGO_MANUAL,
  ETAPAS,
  ETAPA_CLIENTE_LABEL,
  formatEnGrupos,
  formatFolio,
  formatMXN,
  WHATSAPP_NUMERO,
  type Etapa,
} from "@/lib/constants";
import { CopyButton } from "./copy-button";

export const dynamic = "force-dynamic";

export default async function MiTramitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const caso = await db.caso.findUnique({
    where: { tokenPublico: token },
    include: {
      cliente: true,
      tramiteCatalogo: true,
      recibos: { orderBy: { createdAt: "desc" } },
      citas: { orderBy: { fecha: "asc" } },
      archivos: { orderBy: { createdAt: "desc" } },
      actividades: {
        where: { visibleCliente: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!caso) notFound();

  const etapaActualIndex = ETAPAS.indexOf(caso.etapa as Etapa);
  const q = `?token=${token}`;
  const precio = caso.precioCobrado ?? caso.tramiteCatalogo?.honorarioBase ?? null;

  const hermanos = await db.caso.findMany({
    where: { expedienteId: caso.expedienteId, id: { not: caso.id } },
    include: { tramiteCatalogo: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-navy-900 pb-16">
      <header className="border-b border-cream/10 py-5">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/"
            className="font-serif text-lg font-semibold text-cream"
          >
            <span className="text-gold-bright">✦</span> Tramitadora Torres
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="relative rounded-lg bg-paper p-8 text-ink shadow-2xl">
          <div className="pointer-events-none absolute inset-2.5 rounded border border-dashed border-ink/25" />
          <p className="font-mono text-xs uppercase tracking-wide text-navy-700">
            Ticket virtual
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
            {caso.paraQuien || caso.cliente.nombre}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {caso.tramiteCatalogo?.nombre ?? "Trámite por definir"}
          </p>

          <div className="mt-6 rounded bg-navy-900 px-4 py-3 text-cream">
            <p className="font-mono text-[11px] uppercase tracking-wide text-cream-dim">
              Estatus actual
            </p>
            <p className="font-serif text-lg font-semibold text-gold-bright">
              {ETAPA_CLIENTE_LABEL[caso.etapa as Etapa]}
            </p>
          </div>

          <ol className="mt-6 grid grid-cols-3 gap-y-4 sm:grid-cols-6">
            {ETAPAS.map((etapa, i) => {
              const alcanzada = i <= etapaActualIndex;
              return (
                <li key={etapa} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] ${
                      alcanzada
                        ? "bg-gold text-navy-900"
                        : "bg-ink/10 text-ink/40"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-[10px] leading-tight ${
                      alcanzada ? "text-ink" : "text-ink/40"
                    }`}
                  >
                    {ETAPA_CLIENTE_LABEL[etapa].split(" ").slice(0, 3).join(" ")}
                  </span>
                </li>
              );
            })}
          </ol>

          {caso.precioCobrado != null && (
            <div className="mt-6 flex items-baseline justify-between border-t border-ink/10 pt-4">
              <span className="font-mono text-xs text-ink/50">
                Honorario de gestoría
              </span>
              <span className="font-serif text-xl font-bold text-navy-800">
                {formatMXN(caso.precioCobrado)}
              </span>
            </div>
          )}
        </div>

        <section className="mt-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
            Cómo pagar
          </h2>
          <div className="flex flex-col gap-3">
            {caso.tramiteCatalogo?.linkPago && (
              <div className="rounded-lg bg-paper p-4 text-ink shadow">
                <p className="font-serif font-semibold">Pago en línea</p>
                <p className="mt-1 text-sm text-ink/60">
                  Con tarjeta o en efectivo en cualquier OXXO, procesado de
                  forma segura por Stripe.
                </p>
                <a
                  href={caso.tramiteCatalogo.linkPago}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded bg-gold px-4 py-2 font-mono text-sm font-semibold text-navy-900 hover:bg-gold-bright"
                >
                  Pagar
                  {precio != null ? ` ${formatMXN(precio)}` : ""} en línea
                </a>
              </div>
            )}

            <div className="rounded-lg bg-paper p-4 text-ink shadow">
              <p className="font-serif font-semibold">
                Transferencia o depósito en OXXO
              </p>
              <p className="mt-1 text-sm text-ink/60">
                También puedes transferir por SPEI o depositar en efectivo en
                cualquier tienda OXXO a esta cuenta. Envíanos tu comprobante
                por WhatsApp para confirmar tu pago.
              </p>
              <dl className="mt-3 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 font-mono text-sm">
                <dt className="text-ink/45">Banco</dt>
                <dd>{DATOS_PAGO_MANUAL.banco}</dd>
                <dt className="text-ink/45">Titular</dt>
                <dd>{DATOS_PAGO_MANUAL.titular}</dd>
                <dt className="text-ink/45">Tarjeta</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  {formatEnGrupos(DATOS_PAGO_MANUAL.tarjeta)}
                  <CopyButton value={DATOS_PAGO_MANUAL.tarjeta} />
                </dd>
                <dt className="text-ink/45">CLABE</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  {formatEnGrupos(DATOS_PAGO_MANUAL.clabe)}
                  <CopyButton value={DATOS_PAGO_MANUAL.clabe} />
                </dd>
              </dl>
            </div>
          </div>
        </section>

        {caso.citas.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              Citas
            </h2>
            <ul className="flex flex-col gap-2">
              {caso.citas.map((cita) => (
                <li
                  key={cita.id}
                  className="rounded-lg bg-paper p-4 text-ink shadow"
                >
                  <p className="font-serif font-semibold">
                    {new Intl.DateTimeFormat("es-MX", {
                      dateStyle: "long",
                      timeStyle: "short",
                    }).format(cita.fecha)}
                  </p>
                  {cita.lugar && (
                    <p className="text-sm text-ink/70">{cita.lugar}</p>
                  )}
                  {cita.nota && (
                    <p className="mt-1 text-sm text-ink/60">{cita.nota}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {caso.recibos.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              Recibos de pago
            </h2>
            <ul className="flex flex-col gap-2">
              {caso.recibos.map((recibo) => (
                <li
                  key={recibo.id}
                  className="flex items-center justify-between rounded-lg bg-paper p-4 text-ink shadow"
                >
                  <span className="text-sm">
                    Recibo{" "}
                    <span className="font-mono">
                      {formatFolio(recibo.folio)}
                    </span>{" "}
                    · {formatMXN(recibo.monto)}
                  </span>
                  <a
                    href={`/api/recibos/${recibo.id}${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-navy-700 underline hover:text-gold-bright"
                  >
                    Descargar PDF
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {caso.archivos.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              Archivos
            </h2>
            <ul className="flex flex-col gap-2">
              {caso.archivos.map((archivo) => (
                <li
                  key={archivo.id}
                  className="flex items-center justify-between rounded-lg bg-paper p-4 text-ink shadow"
                >
                  <span className="truncate text-sm">{archivo.nombre}</span>
                  <a
                    href={`/api/archivos/${archivo.id}${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-mono text-xs text-navy-700 underline hover:text-gold-bright"
                  >
                    Descargar
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {caso.actividades.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              Avances
            </h2>
            <ol className="flex flex-col gap-3 rounded-lg bg-paper p-4 text-ink shadow">
              {caso.actividades.map((act) => (
                <li key={act.id} className="border-l-2 border-gold/50 pl-3">
                  <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">
                    {new Intl.DateTimeFormat("es-MX", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(act.createdAt)}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/80">
                    {act.descripcion}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {hermanos.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              Otros trámites de tu expediente
            </h2>
            <ul className="flex flex-col gap-2">
              {hermanos.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/mi-tramite/${h.tokenPublico}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-paper p-4 text-ink shadow hover:shadow-md"
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {h.tramiteCatalogo?.nombre ?? "Trámite por definir"}
                      </span>
                      <span className="block text-xs text-ink/50">
                        Para: {h.paraQuien || caso.cliente.nombre}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-navy-700 underline">
                      Ver estatus
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 text-center">
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
              "Hola, tengo una pregunta sobre mi trámite"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded bg-gold px-5 py-2.5 font-mono text-sm font-semibold text-navy-900 hover:bg-gold-bright"
          >
            ¿Dudas? Escríbenos por WhatsApp
          </a>
          <p className="mt-6 text-xs text-cream-dim">
            Tramitadora Torres es una gestoría privada y no forma parte de la
            SRE, la Embajada de Estados Unidos ni de CBP.
          </p>
        </div>
      </div>
    </main>
  );
}
