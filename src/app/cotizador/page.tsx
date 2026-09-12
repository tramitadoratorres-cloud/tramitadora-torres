import type { Metadata } from "next";
import { SiteNav } from "@/app/site-nav";
import { COTIZADOR_TRAMITES, type CotizadorTramiteId } from "@/lib/cotizador";
import { CotizadorForm } from "./cotizador-form";

export const metadata: Metadata = {
  title: "Cotiza tu trámite | Tramitadora Torres",
  description: "Calcula honorarios y derechos oficiales para tu trámite.",
};

export default async function CotizadorPage({
  searchParams,
}: {
  searchParams: Promise<{ tramite?: string }>;
}) {
  const { tramite } = await searchParams;
  const initialTramite = COTIZADOR_TRAMITES.some((item) => item.id === tramite)
    ? (tramite as CotizadorTramiteId)
    : "PASAPORTE_MX";

  return (
    <main className="min-h-screen bg-cream text-navy">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Cotizador en línea</p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-6xl">Tu trámite, claro desde el inicio.</h1>
          <p className="mt-5 text-lg leading-8 text-navy/70">
            Elige el trámite y las personas. Verás por separado los honorarios de gestoría y los derechos oficiales antes de iniciar.
          </p>
        </div>
        <CotizadorForm tramiteInicial={initialTramite} />
      </section>
    </main>
  );
}
