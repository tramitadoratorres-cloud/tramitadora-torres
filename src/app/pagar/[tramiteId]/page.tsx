import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatMXN, WHATSAPP_NUMERO } from "@/lib/constants";
import { CheckoutForm } from "./checkout-form";

export default async function PagarTramitePage({
  params,
}: {
  params: Promise<{ tramiteId: string }>;
}) {
  const { tramiteId } = await params;

  const tramite = await db.tramiteCatalogo.findUnique({
    where: { id: tramiteId },
  });

  if (!tramite || !tramite.activo) notFound();

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-serif text-xl font-semibold text-cream">
            <span className="text-gold-bright">✦</span> Tramitadora Torres
          </Link>
        </div>

        <div className="rounded-lg bg-paper p-8 text-ink shadow-2xl">
          <p className="font-mono text-xs uppercase tracking-wide text-navy-700">
            Pago en línea
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold">
            {tramite.nombre}
          </h1>
          <p className="mt-2 text-sm text-ink/70">{tramite.descripcion}</p>

          <div className="mt-5 flex items-baseline justify-between rounded bg-ink/5 px-4 py-3">
            <span className="font-mono text-xs text-ink/60">
              Honorario de gestoría
            </span>
            <span className="font-serif text-2xl font-bold text-navy-800">
              {formatMXN(tramite.honorarioBase)}
            </span>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            No incluye cuotas oficiales de gobierno (SRE, embajada o CBP);
            esas se pagan aparte, según el trámite.
          </p>

          <div className="mt-6 border-t border-ink/10 pt-6">
            {tramite.linkPago ? (
              <CheckoutForm tramiteId={tramite.id} />
            ) : (
              <div className="flex flex-col gap-3 text-center">
                <p className="text-sm text-ink/60">
                  El pago en línea todavía no está disponible para este
                  trámite. Escríbenos por WhatsApp y con gusto te ayudamos a
                  cotizar y pagar.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
                    `Hola, quiero pagar en línea el trámite de ${tramite.nombre}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded bg-gold px-5 py-3 font-mono text-sm font-semibold text-navy-900 hover:bg-gold-bright"
                >
                  Escribir por WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-cream-dim">
          <Link href="/" className="hover:text-gold-bright">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
