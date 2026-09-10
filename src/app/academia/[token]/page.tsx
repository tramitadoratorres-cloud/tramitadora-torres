import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { WHATSAPP_NUMERO } from "@/lib/constants";
import { esTramiteVisa } from "@/lib/academia";
import { MODULOS_ACADEMIA } from "@/lib/academia-contenido";
import { ChecklistModulo } from "./checklist";
import { SimuladorEntrevista } from "./simulador";

export const dynamic = "force-dynamic";

export default async function AcademiaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const caso = await db.caso.findUnique({
    where: { tokenPublico: token },
    include: { cliente: true, tramiteCatalogo: true },
  });

  if (!caso) notFound();

  const hermanos = await db.caso.findMany({
    where: { expedienteId: caso.expedienteId },
    include: { tramiteCatalogo: true },
  });

  const elegible = hermanos.some((c) => esTramiteVisa(c.tramiteCatalogo?.nombre));

  const nombre = caso.paraQuien || caso.cliente.nombre;

  return (
    <main className="min-h-screen bg-navy-900 pb-16">
      <header className="border-b border-cream/10 py-5">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/" className="font-serif text-lg font-semibold text-cream">
            <span className="text-gold-bright">✦</span> Tramitadora Torres
          </Link>
        </div>
      </header>

      {!elegible ? (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-gold-bright">
            Torres Academy
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-cream">
            Esta sección es para trámites de visa
          </h1>
          <p className="mt-3 text-sm text-cream-dim">
            Torres Academy está disponible para quienes están tramitando su
            visa americana. Si crees que esto es un error, escríbenos.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/mi-tramite/${token}`}
              className="rounded bg-navy-700 px-5 py-2.5 font-mono text-sm text-cream hover:bg-navy-800"
            >
              ← Volver a mi ticket
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
                "Hola, tengo una pregunta sobre Torres Academy"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-gold px-5 py-2.5 font-mono text-sm font-semibold text-navy-900 hover:bg-gold-bright"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-6 py-10">
          {/* Portada */}
          <div className="relative overflow-hidden rounded-lg bg-paper p-8 text-ink shadow-2xl">
            <div className="pointer-events-none absolute inset-2.5 rounded border border-dashed border-ink/25" />
            <p className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-gold-bright">
              🎓 Torres Academy
            </p>
            <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">
              Prepárate para tu entrevista de visa
            </h1>
            <p className="mt-2 text-sm text-ink/60">
              Para {nombre} · Curso completo de la visa americana B1/B2, con
              simulador de entrevista incluido.
            </p>
            <p className="mt-4 text-sm text-ink/70">
              Este es el mismo curso que usamos en Tramitadora Torres,
              basado en más de 14 años de experiencia. Tómate tu tiempo:
              puedes volver a esta página cuando quieras, cuantas veces
              quieras — nada se pierde.
            </p>
          </div>

          {/* Principios */}
          <section className="mt-8 rounded-lg bg-gold/10 border border-gold/30 p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-bright">
              Antes que nada
            </p>
            <h2 className="mt-1 font-serif text-xl font-semibold text-cream">
              Seguridad, honestidad y humildad
            </h2>
            <p className="mt-2 text-sm text-cream-dim">
              No existe un &ldquo;truco&rdquo; ni una respuesta perfecta memorizada. El
              oficial consular entrevista a cientos de personas cada día y
              nota fácilmente cuando alguien recita un discurso. Lo que
              realmente ayuda es presentarte con seguridad en lo que dices,
              honestidad absoluta con cada dato (que además debe coincidir
              con tu DS-160 y tus documentos), y humildad — sin
              sobreexplicar ni tratar de convencer de más. Responde lo que
              te preguntan, con calma, y deja que tus documentos hablen por
              ti.
            </p>
          </section>

          {/* Mapa del curso */}
          <section className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-gold-bright">
              El curso
            </h2>
            <div className="flex flex-col gap-3">
              {MODULOS_ACADEMIA.map((modulo) => (
                <div
                  key={modulo.numero}
                  className="rounded-lg bg-paper p-5 text-ink shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 font-mono text-xs text-gold-bright">
                        {modulo.numero}
                      </span>
                      <div>
                        <p className="font-serif text-lg font-semibold">
                          {modulo.titulo}
                        </p>
                        <p className="text-xs text-ink/50">{modulo.subtitulo}</p>
                      </div>
                    </div>
                    <ChecklistModulo token={token} modulo={modulo.numero} />
                  </div>

                  <details className="mt-3">
                    <summary className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-navy-700 marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="font-bold text-gold">+</span> Ver contenido
                    </summary>
                    <div className="mt-3 flex flex-col gap-4 border-t border-ink/10 pt-3">
                      {modulo.bloques.map((bloque) => (
                        <div key={bloque.titulo}>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                            <span className="text-navy-700">✓</span>
                            {bloque.titulo}
                          </p>
                          {Array.isArray(bloque.texto) ? (
                            <ul className="mt-1 flex flex-col gap-1 pl-5 text-sm text-ink/70">
                              {bloque.texto.map((linea) => (
                                <li key={linea} className="list-disc">
                                  {linea}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-1 text-sm text-ink/70">
                              {bloque.texto}
                            </p>
                          )}
                        </div>
                      ))}
                      <div className="rounded bg-navy-900/5 p-3">
                        <p className="font-mono text-[10px] uppercase tracking-wide text-navy-700">
                          Tip rápido
                        </p>
                        <p className="mt-1 text-sm text-ink/80">{modulo.tip}</p>
                      </div>
                    </div>
                  </details>
                </div>
              ))}

              {/* Módulo 7: simulador interactivo */}
              <div className="rounded-lg bg-paper p-5 text-ink shadow">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold font-mono text-xs text-navy-900">
                    7
                  </span>
                  <div>
                    <p className="font-serif text-lg font-semibold">
                      Simulación de entrevista consular
                    </p>
                    <p className="text-xs text-ink/50">
                      Practica las preguntas más comunes, en tu propio ritmo
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <SimuladorEntrevista token={token} />
                </div>
              </div>
            </div>
          </section>

          <div className="mt-10 text-center">
            <Link
              href={`/mi-tramite/${token}`}
              className="font-mono text-xs text-cream-dim underline hover:text-gold-bright"
            >
              ← Volver a mi ticket virtual
            </Link>
            <p className="mt-6 text-xs text-cream-dim">
              Torres Academy es material de preparación de Tramitadora
              Torres — no sustituye ni garantiza el resultado de tu
              entrevista, que depende exclusivamente del oficial consular.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
