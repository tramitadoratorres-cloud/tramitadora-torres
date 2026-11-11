"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { guardarCotizacionAction, type CotizadorState } from "./actions";
import {
  calcularCotizacionMultiple,
  COTIZADOR_TRAMITES,
  equivalenteUSDEnMXN,
  formatUSD,
  MAX_PARTIDAS,
  type ConfiguracionCotizacion,
  type CotizadorTramiteId,
  type DocumentoUS,
  type ModalidadAdultoUS,
} from "@/lib/cotizador";
import { formatMXN, WHATSAPP_NUMERO } from "@/lib/constants";

const initialState: CotizadorState = {};

const ICONOS: Record<CotizadorTramiteId, string> = {
  PASAPORTE_MX: "✦",
  PASAPORTE_US: "▣",
  VISA_B12: "◉",
  SENTRI: "↗",
  PAQUETE_PASAPORTE_VISA: "✚",
};

type Partida = ConfiguracionCotizacion & { uid: number };

function nuevaPartida(uid: number, tramite: CotizadorTramiteId): Partida {
  return {
    uid,
    tramite,
    adultos: 1,
    menores: 0,
    vigenciaPasaporte: 3,
    documentoAdultoUS: "LIBRETA",
    documentoMenorUS: "LIBRETA",
    modalidadAdultoUS: "RENOVACION",
  };
}

export function CotizadorForm({ tramiteInicial }: { tramiteInicial?: CotizadorTramiteId }) {
  const [partidas, setPartidas] = useState<Partida[]>([nuevaPartida(1, tramiteInicial ?? "PASAPORTE_MX")]);
  const [state, formAction, pending] = useActionState(guardarCotizacionAction, initialState);

  const actualizar = (uid: number, cambios: Partial<ConfiguracionCotizacion>) =>
    setPartidas((actuales) => actuales.map((p) => (p.uid === uid ? { ...p, ...cambios } : p)));
  const agregar = () =>
    setPartidas((actuales) =>
      actuales.length >= MAX_PARTIDAS ? actuales : [...actuales, nuevaPartida(Math.max(...actuales.map((p) => p.uid)) + 1, "VISA_B12")]
    );
  const quitar = (uid: number) => setPartidas((actuales) => (actuales.length > 1 ? actuales.filter((p) => p.uid !== uid) : actuales));

  const cotizacion = useMemo(() => {
    try {
      return calcularCotizacionMultiple(partidas);
    } catch {
      return null;
    }
  }, [partidas]);

  if (state.ok && state.token) {
    const pdfUrl = `/api/cotizaciones/${state.token}/pdf`;
    const whatsapp = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      "Hola, acabo de generar una cotización en línea y quiero continuar con mi trámite."
    )}`;
    return (
      <section className="rounded-2xl bg-paper p-7 text-ink shadow-2xl sm:p-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          Cotización guardada
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold">Ya tienes tu resumen.</h2>
        <p className="mt-3 max-w-lg text-ink/70">
          Guardamos tus datos y tu cotización para que nuestro equipo pueda ayudarte a iniciar el trámite cuando nos escribas.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={pdfUrl} target="_blank" className="rounded bg-navy-900 px-5 py-3 font-mono text-sm font-semibold text-cream transition hover:bg-navy-700">
            Descargar cotización PDF
          </a>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="rounded border border-navy-900 px-5 py-3 font-mono text-sm font-semibold text-navy-900 transition hover:bg-navy-900 hover:text-cream">
            Continuar por WhatsApp
          </a>
        </div>
        <Link href="/cotizador" className="mt-7 inline-block text-sm font-medium text-navy-700 underline underline-offset-4">
          Crear otra cotización
        </Link>
      </section>
    );
  }

  return (
    <form action={formAction} className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-7">
        <section>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-bright">Paso 1</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-cream">Arma tu cotización</h2>
          <p className="mt-2 text-sm text-cream-dim">
            Elige el trámite y cuántas personas lo necesitan. Si necesitas varios (por ejemplo 6 visas y 7 pasaportes), agrega otro trámite con su propia cantidad.
          </p>
        </section>

        {partidas.map((partida, index) => (
          <PartidaCard
            key={partida.uid}
            partida={partida}
            numero={index + 1}
            puedeQuitar={partidas.length > 1}
            onChange={(cambios) => actualizar(partida.uid, cambios)}
            onQuitar={() => quitar(partida.uid)}
          />
        ))}

        {partidas.length < MAX_PARTIDAS && (
          <button type="button" onClick={agregar} className="w-full rounded-xl border border-dashed border-gold/60 px-4 py-4 font-mono text-sm font-semibold text-gold-bright transition hover:bg-gold/10">
            + Agregar otro trámite
          </button>
        )}

        <section className="rounded-xl border border-cream/15 bg-navy-800/50 p-5 sm:p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-bright">Paso 2</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-cream">Guarda tu cotización</h2>
          <p className="mt-2 text-sm text-cream-dim">La enviamos a nuestro sistema para darte seguimiento cuando lo necesites.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input name="nombre" required placeholder="Nombre completo" className="rounded border border-cream/20 bg-navy-900 px-3 py-3 text-sm text-cream placeholder:text-cream/45" />
            <input name="telefono" required inputMode="tel" placeholder="Celular / WhatsApp" className="rounded border border-cream/20 bg-navy-900 px-3 py-3 text-sm text-cream placeholder:text-cream/45" />
            <input name="email" required type="email" placeholder="Correo electrónico" className="rounded border border-cream/20 bg-navy-900 px-3 py-3 text-sm text-cream placeholder:text-cream/45 sm:col-span-2" />
          </div>
          <input type="hidden" name="partidas" value={JSON.stringify(partidas.map(({ uid: _uid, ...resto }) => resto))} />
          {state.error && <p className="mt-4 rounded bg-red-950/50 px-3 py-2 text-sm text-red-200">{state.error}</p>}
          <button disabled={pending || !cotizacion} type="submit" className="mt-5 w-full rounded bg-gold px-5 py-3.5 font-mono text-sm font-bold text-navy-900 transition hover:bg-gold-bright disabled:opacity-60">
            {pending ? "Guardando cotización…" : "Generar mi cotización PDF"}
          </button>
        </section>
      </div>

      <aside className="h-fit rounded-2xl bg-paper p-6 text-ink shadow-2xl lg:sticky lg:top-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-navy-700">Tu cotización</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">{cotizacion ? cotizacion.nombre : "Sin personas"}</h2>
        {cotizacion ? <Resumen cotizacion={cotizacion} /> : <p className="mt-5 text-sm text-red-700">Selecciona al menos una persona para ver el total.</p>}
      </aside>
    </form>
  );
}

function PartidaCard({ partida, numero, puedeQuitar, onChange, onQuitar }: { partida: Partida; numero: number; puedeQuitar: boolean; onChange: (cambios: Partial<ConfiguracionCotizacion>) => void; onQuitar: () => void }) {
  const { tramite, adultos, menores } = partida;
  const seleccionado = COTIZADOR_TRAMITES.find((item) => item.id === tramite)!;
  const mostrarVigencia = tramite === "PASAPORTE_MX" || tramite === "PAQUETE_PASAPORTE_VISA";
  const esPasaporteUS = tramite === "PASAPORTE_US";
  return (
    <section className="rounded-xl border border-cream/15 bg-navy-800/50 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-bright">Trámite {numero}</h3>
        {puedeQuitar && (
          <button type="button" onClick={onQuitar} className="font-mono text-xs text-cream-dim underline underline-offset-4 hover:text-cream">
            Quitar
          </button>
        )}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COTIZADOR_TRAMITES.map((item) => {
          const activo = item.id === tramite;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange({ tramite: item.id })}
              className={`rounded-xl border p-4 text-left transition ${activo ? "border-gold bg-gold/15 shadow-lg" : "border-cream/15 bg-navy-800/60 hover:border-gold/60"}`}
            >
              <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full font-serif text-lg ${activo ? "bg-gold text-navy-900" : "bg-paper/10 text-gold-bright"}`}>
                {ICONOS[item.id]}
              </span>
              <span className="block font-serif text-lg font-semibold text-cream">{item.nombre}</span>
              <span className="mt-1 block text-sm leading-snug text-cream-dim">{item.descripcion}</span>
            </button>
          );
        })}
      </div>

      <h4 className="mt-6 font-serif text-xl font-semibold text-cream">¿Cuántas personas para {seleccionado.nombre.toLowerCase()}?</h4>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Contador label="Adultos" detalle="15 años o más" value={adultos} onChange={(value) => onChange({ adultos: value })} />
        <Contador label="Menores" detalle={tramite === "SENTRI" ? "Menores de 18 años" : "Menores de edad"} value={menores} onChange={(value) => onChange({ menores: value })} />
      </div>

      {mostrarVigencia && (
        <div className="mt-6">
          <h4 className="font-serif text-xl font-semibold text-cream">Vigencia del pasaporte</h4>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {([3, 6, 10] as const).map((vigencia) => (
              <button key={vigencia} type="button" onClick={() => onChange({ vigenciaPasaporte: vigencia })} className={`rounded-lg border px-3 py-4 text-center transition ${partida.vigenciaPasaporte === vigencia ? "border-gold bg-gold text-navy-900" : "border-cream/15 text-cream hover:border-gold/60"}`}>
                <span className="block font-serif text-2xl font-bold">{vigencia}</span>
                <span className="font-mono text-[11px] uppercase">años</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {esPasaporteUS && (
        <div className="mt-6">
          <h4 className="font-serif text-xl font-semibold text-cream">Configura el pasaporte americano</h4>
          {adultos > 0 && <SelectorPasaporteUS titulo="Adultos" documento={partida.documentoAdultoUS ?? "LIBRETA"} setDocumento={(value) => onChange({ documentoAdultoUS: value })} modalidad={partida.modalidadAdultoUS ?? "RENOVACION"} setModalidad={(value) => onChange({ modalidadAdultoUS: value })} />}
          {menores > 0 && <SelectorPasaporteUS titulo="Menores de 16 años" documento={partida.documentoMenorUS ?? "LIBRETA"} setDocumento={(value) => onChange({ documentoMenorUS: value })} />}
        </div>
      )}
    </section>
  );
}

function Contador({ label, detalle, value, onChange }: { label: string; detalle: string; value: number; onChange: (value: number) => void }) {
  return <div className="rounded-lg bg-navy-900 p-4"><p className="font-semibold text-cream">{label}</p><p className="mt-0.5 text-xs text-cream-dim">{detalle}</p><div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-lg text-cream">−</button><input type="number" min={0} max={999} inputMode="numeric" value={value} onChange={(e) => onChange(Math.min(999, Math.max(0, Math.trunc(Number(e.target.value)) || 0)))} className="w-20 bg-transparent text-center font-serif text-3xl font-semibold text-gold-bright outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none" /><button type="button" onClick={() => onChange(Math.min(999, value + 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-lg text-cream">+</button></div></div>;
}

function SelectorPasaporteUS({ titulo, documento, setDocumento, modalidad, setModalidad }: { titulo: string; documento: DocumentoUS; setDocumento: (value: DocumentoUS) => void; modalidad?: ModalidadAdultoUS; setModalidad?: (value: ModalidadAdultoUS) => void }) {
  const tarifas = modalidad === "PRIMERA_VEZ" ? { LIBRETA: 165, TARJETA: 65, AMBOS: 195 } : modalidad === "RENOVACION" ? { LIBRETA: 130, TARJETA: 30, AMBOS: 160 } : { LIBRETA: 135, TARJETA: 50, AMBOS: 150 };
  return <div className="mt-5 border-t border-cream/15 pt-5"><p className="font-semibold text-cream">{titulo}</p>{modalidad && setModalidad && <div className="mt-3 flex gap-2"><Opcion active={modalidad === "RENOVACION"} onClick={() => setModalidad("RENOVACION")}>Renovación</Opcion><Opcion active={modalidad === "PRIMERA_VEZ"} onClick={() => setModalidad("PRIMERA_VEZ")}>Primera vez</Opcion></div>}<p className="mt-4 text-xs uppercase tracking-wide text-cream-dim">Documento</p><div className="mt-2 grid grid-cols-3 gap-2">{(["LIBRETA", "TARJETA", "AMBOS"] as DocumentoUS[]).map((option) => <Opcion key={option} active={documento === option} onClick={() => setDocumento(option)}><span className="block">{option === "LIBRETA" ? "Libreta" : option === "TARJETA" ? "Tarjeta" : "Ambos"}</span><span className="mt-1 block text-[10px] opacity-75">{formatUSD(tarifas[option])} · {formatMXN(equivalenteUSDEnMXN(tarifas[option]))}</span></Opcion>)}</div></div>;
}

function Opcion({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`rounded border px-3 py-2 text-xs font-medium transition ${active ? "border-gold bg-gold text-navy-900" : "border-cream/20 text-cream hover:border-gold/60"}`}>{children}</button>;
}

function Resumen({ cotizacion }: { cotizacion: ReturnType<typeof calcularCotizacionMultiple> }) {
  return <div className="mt-6"><div className="rounded-lg bg-ink/5 p-4"><div className="flex justify-between gap-4 text-sm"><span className="text-ink/65">Personas</span><strong>{cotizacion.personas} · {cotizacion.adultos} adulto{cotizacion.adultos === 1 ? "" : "s"}, {cotizacion.menores} menor{cotizacion.menores === 1 ? "" : "es"}</strong></div></div><div className="mt-5 space-y-3 border-b border-ink/10 pb-5">{cotizacion.lineas.map((linea, index) => <div key={`${linea.etiqueta}-${index}`} className="flex justify-between gap-3 text-sm"><span className="max-w-[70%] text-ink/70">{linea.cantidad > 1 ? `${linea.cantidad} × ` : ""}{linea.etiqueta}</span><strong className="whitespace-nowrap">{linea.moneda === "MXN" ? formatMXN(linea.cantidad * linea.monto) : formatUSD(linea.cantidad * linea.monto)}</strong></div>)}</div><div className="mt-5 space-y-2"><div className="flex justify-between text-sm"><span className="text-ink/65">Total honorarios</span><strong>{formatMXN(cotizacion.honorariosMXN)}</strong></div><div className="flex justify-between text-sm"><span className="text-ink/65">Derechos oficiales MXN</span><strong>{formatMXN(cotizacion.derechosMXN)}</strong></div>{cotizacion.derechosUSD > 0 && <><div className="flex justify-between text-sm"><span className="text-ink/65">Derechos oficiales USD</span><strong>{formatUSD(cotizacion.derechosUSD)}</strong></div><div className="flex justify-between text-sm"><span className="text-ink/65">Equivalente USD en MXN</span><strong>{formatMXN(cotizacion.derechosUSDEnMXN)}</strong></div></>}<div className="mt-4 flex justify-between rounded bg-navy-900 px-4 py-4 text-cream"><span className="font-serif text-lg">Total estimado MXN</span><strong className="font-serif text-2xl text-gold-bright">{formatMXN(cotizacion.totalMXN)}</strong></div>{cotizacion.derechosUSD > 0 && <p className="text-xs leading-relaxed text-ink/60">Incluye la conversión de {formatUSD(cotizacion.derechosUSD)} a {formatMXN(cotizacion.derechosUSDEnMXN)} con tipo de cambio de referencia; el cobro oficial se realiza en USD.</p>}</div><details className="mt-6"><summary className="cursor-pointer font-mono text-xs font-semibold uppercase tracking-wide text-navy-700">Requisitos para iniciar</summary><ul className="mt-3 space-y-2 text-sm text-ink/75">{cotizacion.requisitos.map((item) => <li key={item} className="pl-4 before:mr-2 before:text-gold before:content-['•']">{item}</li>)}</ul></details><p className="mt-5 text-xs leading-relaxed text-ink/55">{cotizacion.notas[0]} Las tarifas pueden modificarse por la dependencia sin previo aviso.</p></div>;
}
