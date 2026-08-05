import Link from "next/link";
import { db } from "@/lib/db";
import { formatFechaHora } from "@/lib/tiempo";
import { WhatsAppButton } from "./whatsapp-button";

export async function DS160PendientesSection() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const ds160Pendientes = await db.formularioDS160.findMany({
    where: { enviado: false, caso: { archivadoEn: null } },
    include: {
      caso: { include: { cliente: true, tramiteCatalogo: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (ds160Pendientes.length === 0) return null;

  return (
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
  );
}
