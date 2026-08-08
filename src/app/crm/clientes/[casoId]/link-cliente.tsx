"use client";

import { useState, useTransition } from "react";
import { regenerarTokenAction } from "./portal-actions";

export function LinkCliente({
  casoId,
  url,
  clienteNombre,
  telefono,
  mensaje,
  mostrarRegenerar = true,
}: {
  casoId: string;
  url: string;
  clienteNombre: string;
  telefono: string;
  mensaje?: string;
  mostrarRegenerar?: boolean;
}) {
  const [copiado, setCopiado] = useState(false);
  const [mensajeCopiado, setMensajeCopiado] = useState(false);
  const [isPending, startTransition] = useTransition();

  const mensajeTexto =
    mensaje ??
    `Hola ${clienteNombre}, gracias por confiar en Tramitadora Torres.\n\nAquí tienes tu ticket digital: puedes revisar en cualquier momento el estatus de tu trámite, tus documentos, tus recibos y tus opciones de pago (en línea, transferencia o depósito en OXXO).\n\n${url}\n\nCualquier duda, estamos para ayudarte.`;
  const mensajeWhatsapp = encodeURIComponent(mensajeTexto);
  const numeroLimpio = telefono.replace(/[^0-9]/g, "");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded border border-ink/15 bg-ink/5 px-3 py-2">
        <input
          readOnly
          value={url}
          className="flex-1 truncate bg-transparent font-mono text-xs text-ink/70 outline-none"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          }}
          className="shrink-0 rounded border border-ink/15 px-2 py-1 font-mono text-xs hover:border-navy-700"
        >
          {copiado ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`https://wa.me/${numeroLimpio}?text=${mensajeWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-navy-900 px-3 py-2 font-mono text-xs text-cream hover:bg-navy-700"
        >
          Enviar por WhatsApp
        </a>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(mensajeTexto);
            setMensajeCopiado(true);
            setTimeout(() => setMensajeCopiado(false), 2000);
          }}
          className="rounded border border-ink/15 px-3 py-2 font-mono text-xs text-ink/70 hover:border-navy-700 hover:text-navy-700"
        >
          {mensajeCopiado ? "¡Copiado!" : "Copiar mensaje con explicación"}
        </button>
        {mostrarRegenerar && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (
                !confirm(
                  "Esto invalida el link anterior del cliente (y el de su forma DS-160, comparten el mismo link). ¿Continuar?"
                )
              )
                return;
              startTransition(() => regenerarTokenAction(casoId));
            }}
            className="font-mono text-xs text-ink/50 hover:text-red-700 disabled:opacity-60"
          >
            Regenerar link
          </button>
        )}
      </div>
    </div>
  );
}
