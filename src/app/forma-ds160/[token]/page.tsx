import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { WHATSAPP_NUMERO } from "@/lib/constants";
import { DS160Form } from "./ds160-form";

export const dynamic = "force-dynamic";

export default async function FormaDS160Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const formulario = await db.formularioDS160.findUnique({
    where: { token },
    include: { caso: { include: { cliente: true } } },
  });

  if (!formulario) notFound();

  const datosIniciales: Record<string, string> = JSON.parse(
    formulario.datosJson
  );
  const nombreSaludo =
    datosIniciales.nombreCompleto || formulario.caso.cliente.nombre;

  return (
    <main className="min-h-screen bg-navy-900 pb-16">
      <header className="border-b border-cream/10 py-5">
        <div className="mx-auto max-w-3xl px-6">
          <Link href="/" className="font-serif text-lg font-semibold text-cream">
            <span className="text-gold-bright">✦</span> Tramitadora Torres
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 rounded-lg bg-paper p-6 text-ink shadow">
          <p className="font-mono text-xs uppercase tracking-wide text-navy-700">
            Forma DS-160
          </p>
          <h1 className="mt-1 font-serif text-2xl font-semibold">
            Hola{nombreSaludo ? `, ${nombreSaludo}` : ""}
          </h1>
          <p className="mt-2 text-sm text-ink/70">
            Llena la información que tengas a la mano para tu solicitud de
            visa americana. <strong>No hay campos obligatorios</strong> —
            puedes llenar solo lo que sepas o tengas listo, guardar, y volver
            después a completar el resto. Cada vez que le das a &quot;Guardar
            respuestas&quot; se actualiza lo que ya tenías.
          </p>
          <p className="mt-2 text-xs text-ink/50">
            Si tu trámite incluye a más de una persona (por ejemplo, toda tu
            familia), cada quien debe llenar su propio cuestionario — pide a
            tu gestor que te comparta tu link individual.
          </p>
        </div>

        <DS160Form token={token} datosIniciales={datosIniciales} />

        <div className="mt-8 text-center">
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
              "Hola, tengo una duda llenando mi forma DS-160"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded bg-navy-800 px-5 py-2.5 font-mono text-sm text-cream hover:bg-navy-700"
          >
            ¿Dudas? Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
