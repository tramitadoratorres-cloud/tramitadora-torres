"use client";

import { useEffect, useRef, useState } from "react";
import { PREGUNTAS_ENTREVISTA } from "@/lib/academia-contenido";

function claveRespuesta(token: string, numero: number) {
  return `academia:${token}:respuesta:${numero}`;
}

export function SimuladorEntrevista({ token }: { token: string }) {
  const total = PREGUNTAS_ENTREVISTA.length;
  const [indice, setIndice] = useState(0);
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false);
  const [respuesta, setRespuesta] = useState("");
  const [puedeHablar, setPuedeHablar] = useState(false);
  const cargado = useRef(false);

  const pregunta = PREGUNTAS_ENTREVISTA[indice];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPuedeHablar(
      typeof window !== "undefined" && "speechSynthesis" in window
    );
  }, []);

  // Carga la respuesta guardada (si la hay) al cambiar de pregunta. Vive en
  // localStorage (solo existe en el navegador), así que se lee en un efecto.
  useEffect(() => {
    cargado.current = false;
    try {
      const guardada = localStorage.getItem(
        claveRespuesta(token, pregunta.numero)
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRespuesta(guardada ?? "");
    } catch {
      setRespuesta("");
    }
    setMostrarSugerencia(false);
    cargado.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice]);

  // Guarda mientras el usuario escribe.
  useEffect(() => {
    if (!cargado.current) return;
    try {
      localStorage.setItem(claveRespuesta(token, pregunta.numero), respuesta);
    } catch {
      // localStorage no disponible: la práctica sigue funcionando, solo no se guarda.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respuesta]);

  function escuchar() {
    if (!puedeHablar) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(pregunta.pregunta);
    utterance.lang = "es-MX";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function siguiente() {
    if (indice < total - 1) setIndice(indice + 1);
  }

  function anterior() {
    if (indice > 0) setIndice(indice - 1);
  }

  return (
    <div className="rounded-lg bg-paper p-6 text-ink shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-wide text-navy-700">
          Pregunta {pregunta.numero} de {total}
        </p>
        <div className="flex gap-1">
          {PREGUNTAS_ENTREVISTA.map((p, i) => (
            <span
              key={p.numero}
              className={`h-1.5 w-4 rounded-full ${
                i <= indice ? "bg-gold" : "bg-ink/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-navy-900 p-5 text-cream">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold-bright">
          El oficial consular pregunta
        </p>
        <p className="mt-2 font-serif text-xl font-semibold sm:text-2xl">
          {pregunta.pregunta}
        </p>
        <p className="mt-1 text-sm text-cream-dim">
          {pregunta.preguntaIngles}
        </p>
        {puedeHablar && (
          <button
            type="button"
            onClick={escuchar}
            className="mt-3 rounded border border-cream/25 px-3 py-1.5 font-mono text-xs text-cream transition hover:border-gold-bright hover:text-gold-bright"
          >
            🔊 Escuchar la pregunta
          </button>
        )}
      </div>

      <div className="mt-4">
        <label className="font-mono text-xs uppercase tracking-wide text-ink/50">
          Practica tu respuesta en voz alta, y escríbela aquí
        </label>
        <textarea
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={3}
          placeholder="Escribe cómo responderías…"
          className="mt-1.5 w-full rounded border border-ink/15 bg-white px-3 py-2 text-sm text-ink"
        />
      </div>

      {!mostrarSugerencia ? (
        <button
          type="button"
          onClick={() => setMostrarSugerencia(true)}
          className="mt-3 rounded bg-gold px-4 py-2 font-mono text-xs font-semibold text-navy-900 transition hover:bg-gold-bright"
        >
          Ver sugerencia de respuesta
        </button>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <div className="rounded border border-gold/30 bg-gold/10 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-navy-700">
              Ejemplo de buena respuesta
            </p>
            <p className="mt-1 text-sm text-ink/80">{pregunta.buenaRespuesta}</p>
          </div>
          <div className="rounded border border-red-700/20 bg-red-50 p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-red-800">
              Evita
            </p>
            <p className="mt-1 text-sm text-ink/80">{pregunta.evitar}</p>
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={anterior}
          disabled={indice === 0}
          className="rounded border border-ink/15 px-3 py-2 font-mono text-xs text-ink/70 transition hover:border-navy-700 disabled:opacity-30"
        >
          ← Anterior
        </button>
        {indice < total - 1 ? (
          <button
            type="button"
            onClick={siguiente}
            className="rounded bg-navy-900 px-4 py-2 font-mono text-xs text-cream transition hover:bg-navy-700"
          >
            Siguiente pregunta →
          </button>
        ) : (
          <span className="font-mono text-xs text-ink/50">
            Esa fue la última — repásalas todas las veces que quieras.
          </span>
        )}
      </div>
    </div>
  );
}
