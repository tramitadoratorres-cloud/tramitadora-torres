export const ETAPAS = [
  "NUEVO_CONTACTO",
  "COTIZADO",
  "DOCUMENTOS_PAGO",
  "EN_TRAMITE",
  "PENDIENTE_DS160",
  "LISTO_ENTREGA",
  "ENTREGADO",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const ETAPA_LABEL: Record<Etapa, string> = {
  NUEVO_CONTACTO: "Nuevo contacto",
  COTIZADO: "Cotizado",
  DOCUMENTOS_PAGO: "Pago y documentos",
  PENDIENTE_DS160: "Pendiente de forma DS-160",
  EN_TRAMITE: "En trámite",
  LISTO_ENTREGA: "Listo para entrega",
  ENTREGADO: "Entregado / Cerrado",
};

// Etiquetas para el ticket virtual del cliente — mismo significado, redactado
// para quien vive su propio trámite, no para el equipo interno.
export const ETAPA_CLIENTE_LABEL: Record<Etapa, string> = {
  NUEVO_CONTACTO: "Recibimos tu solicitud",
  COTIZADO: "Cotización lista",
  DOCUMENTOS_PAGO: "Pago y documentos confirmados",
  PENDIENTE_DS160: "Esperando tu forma DS-160",
  EN_TRAMITE: "En trámite ante la dependencia",
  LISTO_ENTREGA: "¡Listo para entregar!",
  ENTREGADO: "Entregado",
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
  ARCHIVADO: "ARCHIVADO",
  REACTIVADO: "REACTIVADO",
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
  ARCHIVADO: "Archivado (fuera del tablero)",
  REACTIVADO: "Reactivado al tablero",
};

// Tipos de actividad generados por el sistema que por defecto se muestran
// también en el ticket virtual del cliente (son "avances" de su trámite).
// NOTA es la excepción: el agente decide caso por caso si compartirla.
export const ACTIVIDAD_VISIBLE_CLIENTE_DEFAULT: Record<ActividadTipo, boolean> = {
  CREACION: false,
  CAMBIO_ETAPA: true,
  NOTA: false,
  DOCUMENTOS_RECIBIDOS: true,
  PAGO_RECIBIDO: true,
  RECIBO_GENERADO: true,
  TRAMITE_ASIGNADO: true,
  PRECIO_AJUSTADO: false,
  ARCHIVADO: false,
  REACTIVADO: false,
};

// Horas que un caso permanece en ENTREGADO antes de archivarse solo.
export const HORAS_AUTOARCHIVO = 48;

export const ARCHIVO_CATEGORIA = {
  GENERAL: "GENERAL",
  DERECHOS_BANCO: "DERECHOS_BANCO",
} as const;

export type ArchivoCategoria =
  (typeof ARCHIVO_CATEGORIA)[keyof typeof ARCHIVO_CATEGORIA];

export function formatMXN(pesos: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(pesos);
}

export const WHATSAPP_NUMERO = "526644458145";
export const WHATSAPP_DISPLAY = "+52 664 445 8145";

// Cuenta para pagos manuales (transferencia SPEI o depósito en efectivo en
// cualquier OXXO), mostrada en el ticket virtual del cliente junto con el
// link de pago en línea de Stripe.
export const DATOS_PAGO_MANUAL = {
  banco: "BBVA",
  titular: "Jorge Cervantes Torres",
  tarjeta: "4152314216119837",
  clabe: "012028015010935955",
};

// Agrupa dígitos de 4 en 4 para que sean más fáciles de leer y copiar a mano.
export function formatEnGrupos(digitos: string): string {
  return digitos.match(/.{1,4}/g)?.join(" ") ?? digitos;
}

// Los folios de recibo arrancan en este número (ver src/lib/recibo-helper.ts).
export const FOLIO_INICIAL = 6846;

export function formatFolio(folio: number): string {
  return `TT${folio}`;
}
