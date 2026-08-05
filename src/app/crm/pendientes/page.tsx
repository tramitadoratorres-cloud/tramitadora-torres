import Link from "next/link";
import { db } from "@/lib/db";
import { WhatsAppButton } from "../whatsapp-button";
import { formatFechaHora } from "@/lib/tiempo";

export default async function PendientesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const ahora = new Date();
  const en48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

  const [citas, documentosPendientes, ds160Pendientes, pagosPendientes] =
    await Promise.all([
      db.cita.findMany({
        where: {
          fecha: { gte: ahora, lte: en48h },
          caso: { archivadoEn: null },
        },
        include: {
          caso: { include: { cliente: true, tramiteCatalogo: true } },
        },
        orderBy: { fecha: "asc" },
      }),
      db.caso.findMany({
        where: {
          archivadoEn: null,
          etapa: "DOCUMENTOS_PAGO",
          documentosRecibidos: false,
        },
        include: { cliente: true, tramiteCatalogo: true },
        orderBy: { updatedAt: "asc" },
      }),
      db.formularioDS160.findMany({
        where: { enviado: false, caso: { archivadoEn: null } },
        include: {
          caso: { include: { cliente: true, tramiteCatalogo: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      db.caso.findMany({
        where: {
          archivadoEn: null,
          etapa: "DOCUMENTOS_PAGO",
          pagado: false,
        },
        include: { cliente: true, tramiteCatalogo: true },
        orderBy: { updatedAt: "asc" },
      }),
    ]);

  const sinPendientes =
    citas.length === 0 &&
    documentosPendientes.length === 0 &&
    ds160Pendientes.length === 0 &&
    pagosPendientes.length === 0;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">
        Pendientes de hoy
      </h1>
      <p className="mb-6 text-sm text-ink/60">
        Citas de las próximas 48 h, y casos atorados esperando documentos,
        forma DS-160 o pago. Cada uno trae su mensaje de WhatsApp ya
        redactado.
      </p>

      {sinPendientes && (
        <p className="text-sm text-ink/50">No hay pendientes por ahora.</p>
      )}

      {citas.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
            Citas próximas
          </h2>
          <ul className="flex flex-col gap-3">
            {citas.map((cita) => {
              const caso = cita.caso;
              const nombre = caso.paraQuien || caso.cliente.nombre;
              const tramite = caso.tramiteCatalogo?.nombre ?? "tu trámite";
              const fechaTexto = formatFechaHora(cita.fecha, {
                dateStyle: "long",
                timeStyle: "short",
              });
              const mensaje = `Hola ${nombre}, te recordamos tu cita para tu trámite de ${tramite} el ${fechaTexto}${
                cita.lugar ? ` en ${cita.lugar}` : ""
              }. Cualquier duda, escríbenos.`;

              return (
                <li
                  key={cita.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div>
                    <Link
                      href={`/crm/clientes/${caso.id}`}
                      className="font-serif font-semibold text-ink hover:text-navy-700"
                    >
                      {nombre}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink/60">
                      {tramite} · {fechaTexto}
                      {cita.lugar ? ` · ${cita.lugar}` : ""}
                    </p>
                  </div>
                  <WhatsAppButton telefono={caso.cliente.telefono} mensaje={mensaje} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {documentosPendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
            Documentos pendientes
          </h2>
          <ul className="flex flex-col gap-3">
            {documentosPendientes.map((caso) => {
              const nombre = caso.paraQuien || caso.cliente.nombre;
              const tramite = caso.tramiteCatalogo?.nombre ?? "tu trámite";
              const ticketUrl = `${siteUrl}/mi-tramite/${caso.tokenPublico}`;
              const mensaje = `Hola ${nombre}, seguimos esperando tus documentos para continuar con tu trámite de ${tramite}. En cuanto los tengamos, avanzamos. Aquí puedes ver el detalle: ${ticketUrl}`;

              return (
                <li
                  key={caso.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div>
                    <Link
                      href={`/crm/clientes/${caso.id}`}
                      className="font-serif font-semibold text-ink hover:text-navy-700"
                    >
                      {nombre}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink/60">{tramite}</p>
                  </div>
                  <WhatsAppButton telefono={caso.cliente.telefono} mensaje={mensaje} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {ds160Pendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
            Pendientes de forma DS-160
          </h2>
          <ul className="flex flex-col gap-3">
            {ds160Pendientes.map((formulario) => {
              const caso = formulario.caso;
              const nombre = caso.paraQuien || caso.cliente.nombre;
              const tramite = caso.tramiteCatalogo?.nombre ?? "tu trámite";
              const dsUrl = `${siteUrl}/forma-ds160/${formulario.token}`;
              const mensaje = `Hola ${nombre}, para seguir avanzando tu trámite de ${tramite} necesitamos que llenes tu forma DS-160. No es necesario terminarla de una vez, puedes guardar e ir completando: ${dsUrl}`;

              return (
                <li
                  key={formulario.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div>
                    <Link
                      href={`/crm/clientes/${caso.id}`}
                      className="font-serif font-semibold text-ink hover:text-navy-700"
                    >
                      {nombre}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink/60">
                      {tramite} · sin llenar desde{" "}
                      {formatFechaHora(formulario.createdAt, { dateStyle: "medium" })}
                    </p>
                  </div>
                  <WhatsAppButton telefono={caso.cliente.telefono} mensaje={mensaje} />
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {pagosPendientes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink/50">
            Pago pendiente
          </h2>
          <ul className="flex flex-col gap-3">
            {pagosPendientes.map((caso) => {
              const nombre = caso.paraQuien || caso.cliente.nombre;
              const tramite = caso.tramiteCatalogo?.nombre ?? "tu trámite";
              const ticketUrl = `${siteUrl}/mi-tramite/${caso.tokenPublico}`;
              const mensaje = `Hola ${nombre}, tu trámite de ${tramite} está listo para continuar en cuanto confirmemos tu pago. Aquí puedes ver tus opciones de pago: ${ticketUrl}`;

              return (
                <li
                  key={caso.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm"
                >
                  <div>
                    <Link
                      href={`/crm/clientes/${caso.id}`}
                      className="font-serif font-semibold text-ink hover:text-navy-700"
                    >
                      {nombre}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink/60">{tramite}</p>
                  </div>
                  <WhatsAppButton telefono={caso.cliente.telefono} mensaje={mensaje} />
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
