export const ETAPAS = [
  "NUEVO_CONTACTO",
  "COTIZADO",
  "DOCUMENTOS_PAGO",
  "EN_TRAMITE",
  "LISTO_ENTREGA",
  "ENTREGADO",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const ETAPA_LABEL: Record<Etapa, string> = {
  NUEVO_CONTACTO: "Nuevo contacto",
  COTIZADO: "Cotizado",
  DOCUMENTOS_PAGO: "Pago y documentos",
  EN_TRAMITE: "En trámite",
  LISTO_ENTREGA: "Listo para entrega",
  ENTREGADO: "Entregado / Cerrado",
};

export const ORIGEN = {
  WEB: "WEB",
  WEB_PAGO: "WEB_PAGO",
  MANUAL: "MANUAL",
} as const;

export type Origen = (typeof ORIGEN)[keyof typeof ORIGEN];

export const ACTIVIDAD_TIPO = {
  CREACION: "CREACION",
  CAMBIO_ETAPA: "CAMBIO_ETAPA",
  NOTA: "NOTA",
  DOCUMENTOS_RECIBIDOS: "DOCUMENTOS_RECIBIDOS",
  PAGO_RECIBIDO: "PAGO_RECIBIDO",
  RECIBO_GENERADO: "RECIBO_GENERADO",
  TRAMITE_ASIGNADO: "TRAMITE_ASIGNADO",
  PRECIO_AJUSTADO: "PRECIO_AJUSTADO",
} as const;

export type ActividadTipo =
  (typeof ACTIVIDAD_TIPO)[keyof typeof ACTIVIDAD_TIPO];

export const ACTIVIDAD_LABEL: Record<ActividadTipo, string> = {
  CREACION: "Caso creado",
  CAMBIO_ETAPA: "Cambio de etapa",
  NOTA: "Nota",
  DOCUMENTOS_RECIBIDOS: "Documentos recibidos",
  PAGO_RECIBIDO: "Pago recibido",
  RECIBO_GENERADO: "Recibo generado",
  TRAMITE_ASIGNADO: "Trámite asignado",
  PRECIO_AJUSTADO: "Precio ajustado",
};

export function formatMXN(pesos: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export const WHATSAPP_NUMERO = "526644458145";
export const WHATSAPP_DISPLAY = "+52 664 445 8145";
