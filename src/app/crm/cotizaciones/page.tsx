import Link from "next/link";
import { db } from "@/lib/db";
import { formatMXN } from "@/lib/constants";
import { formatUSD, COTIZADOR_TRAMITES } from "@/lib/cotizador";
import { convertirCotizacionAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CotizacionesPage() {
  const cotizaciones = await db.cotizacion.findMany({
    include: { cliente: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-gold">Prospectos</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Cotizaciones web</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/65">Cada cotización pública queda aquí. Conviértela en expediente cuando la persona confirme que iniciará.</p>
      <div className="mt-7 overflow-x-auto rounded-lg border border-ink/10 bg-paper shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-ink/10 bg-ink/[0.03] font-mono text-[11px] uppercase tracking-wide text-ink/55">
            <tr><th className="px-4 py-3">Persona</th><th className="px-4 py-3">Trámite</th><th className="px-4 py-3">Desglose</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {cotizaciones.map((quote) => {
              const tramite = COTIZADOR_TRAMITES.find((item) => item.id === quote.tipo)?.nombre ?? quote.tipo;
              return <tr key={quote.id}>
                <td className="px-4 py-4"><strong>{quote.nombre}</strong><br /><a className="text-xs text-navy-700 hover:underline" href={`https://wa.me/${quote.telefono.replace(/\D/g, "")}`}>{quote.telefono}</a><br /><span className="text-xs text-ink/55">{quote.email}</span></td>
                <td className="px-4 py-4"><strong>{tramite}</strong><br /><span className="text-xs text-ink/55">{quote.adultos} adulto(s) · {quote.menores} menor(es)</span></td>
                <td className="px-4 py-4 text-xs"><div>Honorarios: <strong>{formatMXN(quote.honorariosMXN)}</strong></div><div>Derechos: {formatMXN(quote.derechosMXN)}{quote.derechosUSD ? ` + ${formatUSD(quote.derechosUSD)}` : ""}</div><div className="mt-1 font-semibold">Total MXN: {formatMXN(quote.totalMXN)}</div></td>
                <td className="px-4 py-4 text-xs text-ink/65">{quote.createdAt.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-4">{quote.convertidaEn ? <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Convertida</span> : <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-semibold text-navy-800">Pendiente</span>}</td>
                <td className="px-4 py-4"><div className="flex flex-col items-start gap-2"><Link href={`/api/cotizaciones/${quote.token}/pdf`} target="_blank" className="text-xs font-semibold text-navy-700 hover:underline">Ver PDF</Link>{!quote.convertidaEn && <form action={convertirCotizacionAction}><input type="hidden" name="cotizacionId" value={quote.id} /><button className="rounded bg-navy-900 px-3 py-2 text-xs font-semibold text-cream transition hover:bg-navy-700">Crear expediente</button></form>}</div></td>
              </tr>;
            })}
            {!cotizaciones.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-ink/55">Aún no hay cotizaciones. Compárteles el enlace público para comenzar.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
