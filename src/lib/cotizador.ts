export const COTIZADOR_TRAMITES = [
  {
    id: "PASAPORTE_MX",
    nombre: "Pasaporte mexicano",
    descripcion: "Nuevo o renovación, con vigencia a tu elección.",
    honorarioPorPersona: 500,
    requiereVigencia: true,
    requisitos: [
      "CURP si es menor de edad; INE si es mayor de edad.",
      "Para renovación: foto clara del pasaporte anterior y CURP o INE.",
      "Los documentos se envían por WhatsApp; nosotros revisamos y generamos tu cita.",
    ],
  },
  {
    id: "PASAPORTE_US",
    nombre: "Pasaporte americano",
    descripcion: "Libreta, tarjeta o ambas; primera vez o renovación.",
    honorarioPorPersona: 1000,
    requiereDocumentoUS: true,
    requisitos: [
      "Acta de nacimiento estadounidense o prueba de ciudadanía.",
      "Número de Seguro Social.",
      "Para renovación: pasaporte anterior e identificación vigente.",
    ],
  },
  {
    id: "VISA_B12",
    nombre: "Visa de turista B1/B2",
    descripcion: "Citas, formas, requisitos y asesoría de principio a fin.",
    honorarioPorPersona: 1000,
    requisitos: [
      "Pasaporte mexicano vigente.",
      "Correo electrónico activo.",
      "Visa anterior, si se trata de renovación.",
    ],
  },
  {
    id: "SENTRI",
    nombre: "SENTRI",
    descripcion: "Programa de cruce rápido para personas preaprobadas.",
    honorarioPorPersona: 1000,
    requisitos: [
      "Visa americana, tarjeta de cruce o green card vigente.",
      "Acta de nacimiento o pasaporte.",
      "Si agregas vehículo: licencia de conducir y tarjeta de circulación.",
    ],
  },
  {
    id: "PAQUETE_PASAPORTE_VISA",
    nombre: "Paquete pasaporte + visa",
    descripcion: "Pasaporte mexicano y visa B1/B2 en un solo seguimiento.",
    honorarioPorPersona: 1500,
    requiereVigencia: true,
    requisitos: [
      "CURP si es menor de edad; INE si es mayor de edad.",
      "Pasaporte mexicano anterior, si es renovación.",
      "Correo electrónico activo para la visa.",
    ],
  },
] as const;

export type CotizadorTramiteId = (typeof COTIZADOR_TRAMITES)[number]["id"];

export type DocumentoUS = "LIBRETA" | "TARJETA" | "AMBOS";
export type ModalidadAdultoUS = "PRIMERA_VEZ" | "RENOVACION";

export type ConfiguracionCotizacion = {
  tramite: CotizadorTramiteId;
  adultos: number;
  menores: number;
  vigenciaPasaporte?: 3 | 6 | 10;
  documentoAdultoUS?: DocumentoUS;
  documentoMenorUS?: DocumentoUS;
  modalidadAdultoUS?: ModalidadAdultoUS;
};

export type CotizacionCalculada = {
  tramite: (typeof COTIZADOR_TRAMITES)[number];
  adultos: number;
  menores: number;
  personas: number;
  honorariosMXN: number;
  derechosMXN: number;
  derechosUSD: number;
  derechosUSDEnMXN: number;
  totalMXN: number;
  lineas: Array<{ etiqueta: string; cantidad: number; monto: number; moneda: "MXN" | "USD" }>;
  requisitos: string[];
  notas: string[];
};

// Tipo de cambio FIX de Banxico, 11 de septiembre de 2026. Se muestra como
// referencia para consolidar el estimado; el cobro en USD puede variar al pagar.
export const USD_A_MXN_REFERENCIA = 16.9707;

export function equivalenteUSDEnMXN(dolares: number) {
  return Math.round(dolares * USD_A_MXN_REFERENCIA);
}

const PASAPORTE_MX_DERECHOS: Record<3 | 6 | 10, number> = {
  3: 1795,
  6: 2440,
  10: 4280,
};

const PASAPORTE_US_ADULTO_PRIMERA: Record<DocumentoUS, number> = {
  LIBRETA: 165,
  TARJETA: 65,
  AMBOS: 195,
};

const PASAPORTE_US_ADULTO_RENOVACION: Record<DocumentoUS, number> = {
  LIBRETA: 130,
  TARJETA: 30,
  AMBOS: 160,
};

const PASAPORTE_US_MENOR: Record<DocumentoUS, number> = {
  LIBRETA: 135,
  TARJETA: 50,
  AMBOS: 150,
};

function tramitePorId(id: CotizadorTramiteId) {
  const tramite = COTIZADOR_TRAMITES.find((item) => item.id === id);
  if (!tramite) throw new Error("Trámite no disponible para cotización.");
  return tramite;
}

function etiquetaDocumento(documento: DocumentoUS) {
  return documento === "LIBRETA"
    ? "Libreta"
    : documento === "TARJETA"
      ? "Tarjeta pasaporte"
      : "Libreta + tarjeta";
}

export function calcularCotizacion(config: ConfiguracionCotizacion): CotizacionCalculada {
  const tramite = tramitePorId(config.tramite);
  const adultos = Math.max(0, Math.min(3, Math.trunc(config.adultos)));
  const menores = Math.max(0, Math.min(3, Math.trunc(config.menores)));
  const personas = adultos + menores;

  if (!personas) throw new Error("Selecciona al menos una persona.");

  const lineas: CotizacionCalculada["lineas"] = [];
  const notas: string[] = [
    "Los derechos oficiales se pagan directamente a la dependencia correspondiente.",
    "Los honorarios corresponden únicamente al servicio de Tramitadora Torres.",
  ];
  let derechosMXN = 0;
  let derechosUSD = 0;

  const agregarMXN = (etiqueta: string, cantidad: number, monto: number) => {
    if (!cantidad) return;
    lineas.push({ etiqueta, cantidad, monto, moneda: "MXN" });
    derechosMXN += cantidad * monto;
  };
  const agregarUSD = (etiqueta: string, cantidad: number, monto: number) => {
    if (!cantidad) return;
    lineas.push({ etiqueta, cantidad, monto, moneda: "USD" });
    derechosUSD += cantidad * monto;
  };

  if (config.tramite === "PASAPORTE_MX" || config.tramite === "PAQUETE_PASAPORTE_VISA") {
    const vigencia = config.vigenciaPasaporte ?? 3;
    agregarMXN(`Derechos de pasaporte mexicano · ${vigencia} años`, personas, PASAPORTE_MX_DERECHOS[vigencia]);
    notas.push("Vigencias de 3, 6 y 10 años disponibles para adultos y menores, según los datos proporcionados.");
  }

  if (config.tramite === "VISA_B12" || config.tramite === "PAQUETE_PASAPORTE_VISA") {
    agregarMXN("Derechos de visa B1/B2 · adulto", adultos, 3330);
    agregarMXN("Derechos de visa B1/B2 · menor de 15 años", menores, 285);
    notas.push("La tarifa reducida de menor aplica a solicitantes menores de 15 años que cumplan las condiciones consulares aplicables.");
  }

  if (config.tramite === "SENTRI") {
    agregarUSD("Derechos oficiales SENTRI · adulto", adultos, 120);
    agregarUSD("Derechos oficiales SENTRI · menor de 18 años", menores, 0);
    notas.push("CBP publica US$120 por adulto y US$0 para menores de 18 años. El cargo oficial se muestra en dólares estadounidenses.");
  }

  if (config.tramite === "PASAPORTE_US") {
    const documentoAdulto = config.documentoAdultoUS ?? "LIBRETA";
    const documentoMenor = config.documentoMenorUS ?? "LIBRETA";
    const modalidadAdulto = config.modalidadAdultoUS ?? "RENOVACION";
    const tarifaAdulto = modalidadAdulto === "PRIMERA_VEZ"
      ? PASAPORTE_US_ADULTO_PRIMERA[documentoAdulto]
      : PASAPORTE_US_ADULTO_RENOVACION[documentoAdulto];
    const etiquetaAdulto = modalidadAdulto === "PRIMERA_VEZ" ? "primera vez" : "renovación";
    agregarUSD(`Pasaporte americano · adulto · ${etiquetaAdulto} · ${etiquetaDocumento(documentoAdulto)}`, adultos, tarifaAdulto);
    agregarUSD(`Pasaporte americano · menor · primera vez · ${etiquetaDocumento(documentoMenor)}`, menores, PASAPORTE_US_MENOR[documentoMenor]);
    notas.push("Los importes de pasaporte americano incluyen la cuota de aceptación cuando corresponde. Los menores de 16 años tramitan como primera vez.");
  }

  const honorariosMXN = personas * tramite.honorarioPorPersona;
  const derechosUSDEnMXN = equivalenteUSDEnMXN(derechosUSD);
  lineas.unshift({
    etiqueta: `Honorarios de gestoría · ${tramite.nombre}`,
    cantidad: personas,
    monto: tramite.honorarioPorPersona,
    moneda: "MXN",
  });

  return {
    tramite,
    adultos,
    menores,
    personas,
    honorariosMXN,
    derechosMXN,
    derechosUSD,
    derechosUSDEnMXN,
    totalMXN: honorariosMXN + derechosMXN + derechosUSDEnMXN,
    lineas,
    requisitos: [...tramite.requisitos],
    notas,
  };
}

export function formatUSD(dolares: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dolares);
}

export const FUENTES_TARIFAS = {
  pasaporteMexico: "https://www.gob.mx/pasaporte/",
  visaEstadosUnidos: "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/fees/fees-visa-services.html",
  pasaporteEstadosUnidos: "https://travel.state.gov/content/dam/passports/forms-fees/Accessible_Passport_Fee_Chart_Apr_2026.pdf",
  sentri: "https://www.help.cbp.gov/s/article/Article-1068?language=en_US",
};
