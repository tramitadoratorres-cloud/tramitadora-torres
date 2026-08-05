"use client";

import { ETAPA_CLIENTE_LABEL, type Etapa } from "@/lib/constants";
import { WhatsAppButton } from "./whatsapp-button";

export interface AvisoEtapaInfo {
  telefono: string;
  nombre: string;
  tramite: string;
  etapa: Etapa;
  ticketUrl: string;
}

export function AvisoEtapaToast({
  aviso,
  onClose,
}: {
  aviso: AvisoEtapaInfo;
  onClose: () => void;
}) {
  const mensaje = `Hola ${aviso.nombre}, tenemos una actualización de tu trámite de ${aviso.tramite}: ${ETAPA_CLIENTE_LABEL[aviso.etapa]}. Puedes ver todos los detalles aquí: ${aviso.ticketUrl}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-lg bg-navy-900 p-4 text-cream shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm">
          Se movió a{" "}
          <span className="font-semibold text-gold-bright">
            {ETAPA_CLIENTE_LABEL[aviso.etapa]}
          </span>
          . ¿Avisar a {aviso.nombre} por WhatsApp?
        </p>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 font-mono text-xs text-cream-dim hover:text-cream"
        >
          ✕
        </button>
      </div>
      <div className="mt-3">
        <WhatsAppButton
          telefono={aviso.telefono}
          mensaje={mensaje}
          onClick={onClose}
          className="rounded bg-gold px-3 py-1.5 font-mono text-xs font-semibold text-navy-900 hover:bg-gold-bright"
        />
      </div>
    </div>
  );
}
