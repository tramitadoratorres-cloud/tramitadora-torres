import { db } from "@/lib/db";
import { formatMXN, WHATSAPP_NUMERO, WHATSAPP_DISPLAY } from "@/lib/constants";
import { SiteNav } from "./site-nav";
import { LeadForm } from "./lead-form";

function wa(mensaje: string) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

// Evita que Next intente prerenderizar esta página en build time, cuando la
// base de datos todavía no existe en el servidor de despliegue.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tramites = await db.tramiteCatalogo.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });

  return (
    <>
      <SiteNav />

      <section className="relative overflow-hidden border-b border-cream/10 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-gold-bright">
              Gestoría de trámites en línea · Cobertura en todo México
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-cream sm:text-5xl">
              Tu pasaporte, visa o SENTRI,{" "}
              <em className="not-italic text-gold-bright">
                sin adivinar qué papeles llevar.
              </em>
            </h1>
            <p className="mt-5 max-w-md text-lg text-cream-dim">
              Te decimos exactamente qué necesitas, agendamos tu cita y le
              damos seguimiento a tu trámite de principio a fin — para que
              solo te preocupes de tu viaje.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <a
                href={wa("Hola, quiero cotizar un trámite")}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-gold px-5 py-3 font-mono text-sm font-semibold text-navy-900 transition hover:-translate-y-0.5 hover:bg-gold-bright"
              >
                Cotiza por WhatsApp
              </a>
              <a
                href="#tramites"
                className="rounded border border-cream/15 px-5 py-3 font-mono text-sm text-cream transition hover:border-gold-bright hover:text-gold-bright"
              >
                Ver trámites y precios
              </a>
            </div>
          </div>

          <div className="relative rounded-lg bg-paper p-8 text-ink shadow-2xl [transform:rotate(-1.2deg)]">
            <div className="pointer-events-none absolute inset-2.5 rounded border border-dashed border-ink/25" />
            <div className="mb-5 flex items-start justify-between">
              <span className="font-mono text-xs uppercase tracking-wide text-navy-700">
                Comprobante de gestoría
              </span>
              <div className="flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full border-2 border-gold text-center font-mono text-[10px] leading-tight text-gold">
                SELLO
                <br />
                VÁLIDO
              </div>
            </div>
            <div className="mb-4">
              <div className="font-mono text-[11px] uppercase tracking-wide text-ink/55">
                Trámite
              </div>
              <div className="font-serif text-lg font-semibold">
                SENTRI — Cruce rápido
              </div>
            </div>
            <div className="mb-4">
              <div className="font-mono text-[11px] uppercase tracking-wide text-ink/55">
                Honorario de gestoría
              </div>
              <div className="font-serif text-lg font-semibold">
                $1,000 MXN
              </div>
            </div>
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-ink/55">
                Estatus
              </div>
              <div className="font-serif text-lg font-semibold">
                Documentos recibidos
              </div>
            </div>
            <div
              className="mt-5 h-8 opacity-85"
              style={{
                background:
                  "repeating-linear-gradient(90deg, var(--color-ink) 0 2px, transparent 2px 5px, var(--color-ink) 5px 7px, transparent 7px 12px)",
              }}
            />
          </div>
        </div>
      </section>

      <section id="tramites" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-bright">
              Trámites
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-cream sm:text-4xl">
              Elige tu trámite
            </h2>
            <p className="mt-3 text-cream-dim">
              El precio que ves es solo nuestro honorario de gestoría. Las
              cuotas oficiales de gobierno (SRE, embajada o CBP) se pagan
              aparte, directamente o con el enlace que te compartimos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tramites.map((tramite, i) => {
              const requisitos = tramite.requisitos
                .split("\n")
                .map((r) => r.trim())
                .filter(Boolean);
              return (
                <article
                  key={tramite.id}
                  className={`flex flex-col overflow-hidden rounded-md bg-paper text-ink shadow-lg transition hover:-translate-y-1 ${
                    tramite.destacado ? "outline outline-2 outline-gold" : ""
                  }`}
                >
                  <div className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="font-mono text-xs text-ink/50">
                        N.º {String(i + 1).padStart(2, "0")}
                      </span>
                      {tramite.badge && (
                        <span className="whitespace-nowrap rounded-full bg-gold px-2 py-0.5 font-mono text-[11px] font-semibold text-navy-900">
                          {tramite.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3.5 font-serif text-xl font-semibold">
                      {tramite.nombre}
                    </h3>
                    <p className="mt-2 text-sm text-ink/70">
                      {tramite.descripcion}
                    </p>
                  </div>

                  <div className="relative mx-5 border-t-2 border-dashed border-ink/20">
                    <span className="absolute -left-[31px] -top-[9px] h-[18px] w-[18px] rounded-full bg-navy-900" />
                    <span className="absolute -right-[31px] -top-[9px] h-[18px] w-[18px] rounded-full bg-navy-900" />
                  </div>

                  <div className="mt-auto p-5 pt-4.5">
                    <div className="mb-3.5 flex items-baseline justify-between">
                      <span className="font-serif text-2xl font-bold text-navy-800">
                        {formatMXN(tramite.honorarioBase)}
                      </span>
                      <span className="font-mono text-[11px] text-ink/50">
                        honorario · MXN
                      </span>
                    </div>
                    {requisitos.length > 0 && (
                      <details className="mb-3.5">
                        <summary className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-navy-700 marker:content-none [&::-webkit-details-marker]:hidden">
                          <span className="font-bold text-gold">+</span> Qué
                          necesitas enviarnos
                        </summary>
                        <ul className="mt-2.5 flex flex-col gap-1">
                          {requisitos.map((req) => (
                            <li
                              key={req}
                              className="relative pl-4 text-sm text-ink/75"
                            >
                              <span className="absolute left-0 text-gold">
                                ·
                              </span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/pagar/${tramite.id}`}
                        className="block rounded bg-gold py-2.5 text-center font-mono text-sm font-semibold text-navy-900 transition hover:bg-gold-bright"
                      >
                        Pagar en línea
                      </a>
                      <a
                        href={wa(`Hola, quiero información de ${tramite.nombre}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded bg-navy-900 py-2.5 text-center font-mono text-sm font-medium text-cream transition hover:bg-navy-700"
                      >
                        Preguntar por WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-gold-bright">
              Proceso
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-cream sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-3 text-cream-dim">
              Cuatro pasos, del primer mensaje a tener tu documento en mano.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Cotizamos tu trámite", "Nos escribes por WhatsApp, te decimos precio y documentos exactos."],
              ["Nos envías tus documentos", "Por WhatsApp o correo — revisamos que todo esté completo antes de iniciar."],
              ["Nosotros gestionamos", "Agendamos tu cita y le damos seguimiento hasta que esté lista."],
              ["Recibes tu documento", "Te avisamos apenas esté listo para que lo recojas."],
            ].map(([title, desc], i) => (
              <div key={title}>
                <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-full bg-gold-bright font-mono text-sm font-semibold text-navy-900">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-cream">
                  {title}
                </h3>
                <p className="text-sm text-cream-dim">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-cream/10 bg-navy-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              ["Sin letras chiquitas", "Precios claros desde el inicio", "Sabes exactamente qué es nuestro honorario y qué es cuota de gobierno."],
              ["Seguimiento real", "Sabes en qué va tu trámite", "Te avisamos en cada etapa, no tienes que estar preguntando."],
              ["Atención cercana", "Equipo pequeño, trato directo", "Hablas con la misma gestoría de principio a fin, no con un call center."],
            ].map(([eyebrow, title, desc]) => (
              <div key={title}>
                <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-gold-bright">
                  {eyebrow}
                </p>
                <h3 className="mb-2 text-lg font-semibold text-cream">
                  {title}
                </h3>
                <p className="text-sm text-cream-dim">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="bg-gradient-to-b from-navy-900 to-navy-800 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-center gap-10 rounded-2xl bg-paper p-8 text-ink sm:p-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-navy-700">
                Contacto
              </p>
              <h2 className="mb-3.5 font-serif text-3xl font-semibold sm:text-4xl">
                ¿Listo para empezar tu trámite?
              </h2>
              <p className="mb-6 max-w-md text-ink/75">
                Escríbenos por WhatsApp o llena el formulario y te contactamos
                nosotros.
              </p>
              <LeadForm
                tramites={tramites.map((t) => ({ id: t.id, nombre: t.nombre }))}
              />
            </div>
            <div className="flex flex-col gap-3 font-mono text-sm text-ink/70">
              <div>
                <strong className="block font-sans text-ink">WhatsApp</strong>
                {WHATSAPP_DISPLAY}
              </div>
              <div>
                <strong className="block font-sans text-ink">Horario</strong>
                Lunes a viernes · 9:00–18:00
                <br />
                Sábado · 9:00–14:00
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 pb-4 pt-9 text-center">
        <p className="mx-auto mb-4.5 max-w-xl text-xs text-cream/45">
          Tramitadora Torres es una gestoría privada y no forma parte de la
          SRE, la Embajada de Estados Unidos ni de CBP. Las cuotas oficiales
          de gobierno se pagan por separado según cada dependencia.
        </p>
        <p className="text-xs text-cream-dim">
          © {new Date().getFullYear()} Tramitadora Torres · Gestoría de
          trámites internacionales
        </p>
      </footer>
    </>
  );
}
