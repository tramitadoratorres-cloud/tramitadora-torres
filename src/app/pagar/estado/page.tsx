import Link from "next/link";
import { db } from "@/lib/db";
import { WHATSAPP_NUMERO } from "@/lib/constants";

export default async function EstadoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const casoId = typeof params.caso === "string" ? params.caso : undefined;
  const status =
    (typeof params.status === "string" && params.status) ||
    (typeof params.collection_status === "string" && params.collection_status) ||
    "pending";

  const caso = casoId
    ? await db.caso.findUnique({
        where: { id: casoId },
        include: { tramiteCatalogo: true },
      })
    : null;

  const pagado = caso?.pagado ?? status === "approved";

  const contenido = pagado
    ? {
        titulo: "¡Pago recibido!",
        mensaje:
          "Ya registramos tu pago y tu trámite en nuestro sistema. En breve te contactamos por WhatsApp para pedirte los documentos y darte seguimiento.",
      }
    : status === "rejected"
      ? {
          titulo: "El pago no se pudo procesar",
          mensaje:
            "Tu pago fue rechazado o cancelado. Puedes intentar de nuevo o escribirnos por WhatsApp para pagar por otro medio.",
        }
      : {
          titulo: "Pago en proceso",
          mensaje:
            "Estamos esperando la confirmación de tu pago (por ejemplo, si elegiste pagar en OXXO, se confirma cuando lo cubras en tienda). Te avisamos por WhatsApp en cuanto quede confirmado.",
        };

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="font-serif text-xl font-semibold text-cream">
          <span className="text-gold-bright">✦</span> Tramitadora Torres
        </Link>

        <div className="mt-6 rounded-lg bg-paper p-8 text-ink shadow-2xl">
          <h1 className="font-serif text-2xl font-semibold">
            {contenido.titulo}
          </h1>
          <p className="mt-3 text-sm text-ink/70">{contenido.mensaje}</p>
          {caso?.tramiteCatalogo && (
            <p className="mt-4 font-mono text-xs uppercase tracking-wide text-ink/50">
              Trámite: {caso.tramiteCatalogo.nombre}
            </p>
          )}

          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
              "Hola, acabo de pagar en línea un trámite y quiero dar seguimiento"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block rounded bg-navy-900 py-2.5 text-center font-mono text-sm font-medium text-cream transition hover:bg-navy-700"
          >
            Escribir por WhatsApp
          </a>
        </div>

        <p className="mt-6 text-sm text-cream-dim">
          <Link href="/" className="hover:text-gold-bright">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
