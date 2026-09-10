// Contenido de "Torres Academy" — curso de preparación para la visa
// americana B1/B2, basado en el material de Tramitadora Torres.
// Vive en código (no en la base de datos) porque es contenido editorial,
// no un dato del negocio: para cambiarlo, se edita este archivo.

export interface BloqueContenido {
  titulo: string;
  texto: string | string[];
}

export interface ModuloAcademia {
  numero: number;
  titulo: string;
  subtitulo: string;
  bloques: BloqueContenido[];
  tip: string;
}

export const MODULOS_ACADEMIA: ModuloAcademia[] = [
  {
    numero: 1,
    titulo: "Introducción al trámite de visa americana",
    subtitulo: "Los conceptos básicos, sin mitos",
    bloques: [
      {
        titulo: "¿Qué es la visa americana?",
        texto: "Un documento oficial que emite el gobierno de Estados Unidos y que se coloca en tu pasaporte. Te permite solicitar tu entrada al país para un propósito específico (turismo o negocios) y por tiempo limitado. No es una garantía de entrada: la decisión final siempre la toma el oficial de migración en el puerto de entrada, no el consulado.",
      },
      {
        titulo: "Tipos de visa más comunes",
        texto: [
          "B1: Negocios",
          "B2: Turismo",
          "B1/B2: Combinada — la más común, cubre ambos motivos con la misma visa.",
        ],
      },
      {
        titulo: "¿Quién puede aplicar?",
        texto: "Cualquier persona que cumpla con los requisitos del consulado y pueda demostrar que su viaje es temporal, que tiene un motivo claro, y que mantiene vínculos suficientes con su país de origen para regresar al terminar su viaje.",
      },
      {
        titulo: "Mitos comunes",
        texto: [
          "\"Si tengo visa me puedo quedar allá\": FALSO. La visa solo te da el derecho a solicitar tu entrada; cuánto tiempo puedes permanecer lo decide el oficial de migración en el aeropuerto o cruce, no tú.",
          "\"Debo tener mucho dinero\": No necesariamente, pero sí debes demostrar estabilidad y que puedes financiar tu viaje sin necesidad de trabajar allá.",
          "\"Si me la niegan ya no puedo volver a aplicar\": Falso. Puedes volver a solicitarla — pero conviene fortalecer tu perfil antes de intentarlo de nuevo.",
        ],
      },
    ],
    tip: "Aprende los conceptos básicos primero: te ayuda a contestar con seguridad en la entrevista.",
  },
  {
    numero: 2,
    titulo: "Requisitos y documentación",
    subtitulo: "Qué necesitas según tu caso",
    bloques: [
      {
        titulo: "Formulario DS-160",
        texto: "El formulario oficial que se llena en línea, en el sitio del Departamento de Estado. Es la base de toda tu solicitud: todo lo que digas en la entrevista debe coincidir con lo que ahí declaraste.",
      },
      {
        titulo: "Documentos para primera vez",
        texto: [
          "Pasaporte vigente",
          "Confirmación del DS-160 (la hoja con el código de barras)",
          "Comprobante de pago",
          "Citas impresas del CAS y del consulado",
        ],
      },
      {
        titulo: "Renovación",
        texto: [
          "Pasaporte vigente y el anterior, con la visa vencida",
          "DS-160 actualizado",
          "Pago del trámite",
          "Puede no requerir entrevista, según tu perfil y el consulado",
        ],
      },
      {
        titulo: "Menores y adultos mayores",
        texto: "Menores de 14 años y mayores de 79 pueden estar exentos de entrevista, pero deben cumplir con la documentación básica igual.",
      },
    ],
    tip: "Imprime todo y lleva copias claras, ordenadas por secciones. La presentación ordenada transmite confianza.",
  },
  {
    numero: 3,
    titulo: "Proceso paso a paso",
    subtitulo: "DS-160 → Pago → Cita CAS → Entrevista → Entrega",
    bloques: [
      {
        titulo: "1. Llenar el DS-160",
        texto: "Ingresa al sitio oficial, crea tu solicitud, responde con cuidado cada sección y guarda tu número de confirmación — lo vas a necesitar en cada paso siguiente.",
      },
      {
        titulo: "2. Pagar",
        texto: "Realiza el pago en el banco autorizado según tu país. Guarda tu recibo: lo necesitas para agendar tu cita.",
      },
      {
        titulo: "3. Cita en el CAS",
        texto: "Te toman huellas y fotografía. Lleva tu pasaporte, la confirmación del DS-160 y el comprobante de pago.",
      },
      {
        titulo: "4. Entrevista en el consulado",
        texto: "Responde con claridad. Entrega solo los documentos que te pida el oficial, sin adelantarte a mostrar de más.",
      },
      {
        titulo: "5. Después",
        texto: "Si te aprueban, la visa se estampa en tu pasaporte y se entrega aproximadamente en 3 a 4 días hábiles (puede variar según el consulado).",
      },
    ],
    tip: "No pagues ni agendes tu cita hasta revisar que tu DS-160 esté correcto y guardado — un error ahí puede complicarte después.",
  },
  {
    numero: 4,
    titulo: "Entrevista consular",
    subtitulo: "El momento decisivo",
    bloques: [
      {
        titulo: "¿Qué es?",
        texto: "El paso final del proceso, donde un oficial consular evalúa tu caso en persona. Suele durar entre 3 y 5 minutos y busca confirmar que tu viaje es temporal, que tienes un motivo genuino, y que vas a regresar a tu país.",
      },
      {
        titulo: "Documentos que debes llevar",
        texto: [
          "Pasaporte vigente",
          "Confirmación del DS-160",
          "Comprobante de pago",
          "Citas impresas",
        ],
      },
      {
        titulo: "Qué decir y qué evitar",
        texto: "Sé honesto. Evita mentir, evita bromear con el oficial, y evita dar más información de la que te piden.",
      },
      {
        titulo: "Cómo vestirse",
        texto: "Formal o semi-formal. Evita ropa deportiva, gorras o playeras con mensajes — no es examen de moda, pero sí transmite seriedad.",
      },
      {
        titulo: "Consejos finales",
        texto: "Llega puntual, lleva tus documentos ordenados y responde con seguridad, sin recitar un discurso memorizado.",
      },
    ],
    tip: "Responde solo lo necesario. La claridad vale más que el discurso.",
  },
  {
    numero: 5,
    titulo: "Errores que causan rechazo",
    subtitulo: "Los siete más comunes",
    bloques: [
      {
        titulo: "1. Información falsa o dudosa",
        texto: "Contradicciones entre lo que dices y tus documentos o tu DS-160.",
      },
      {
        titulo: "2. No demostrar lazos fuertes con tu país",
        texto: "Falta de empleo formal, negocio, propiedades, familia o estudios que te aten a regresar.",
      },
      {
        titulo: "3. Motivo del viaje poco claro",
        texto: "Respuestas vagas o con dudas hacen parecer que no tienes un plan real.",
      },
      {
        titulo: "4. Actitud insegura o evasiva",
        texto: "Nervios excesivos, evitar contacto visual o titubear demasiado puede generar sospecha, aunque digas la verdad.",
      },
      {
        titulo: "5. DS-160 mal llenado",
        texto: "Errores en datos, fechas, direcciones, o inconsistencias con tu pasaporte.",
      },
      {
        titulo: "6. Documentos incompletos o desorganizados",
        texto: "Papeles vencidos o desordenados dan mala impresión desde el inicio.",
      },
      {
        titulo: "7. Hablar de más",
        texto: "Tratar de convencer al oficial con un discurso largo suele generar más dudas que confianza.",
      },
    ],
    tip: "La consistencia manda: lo que dices debe coincidir con tu DS-160 y tus documentos.",
  },
  {
    numero: 6,
    titulo: "Casos especiales, renovación y consejos clave",
    subtitulo: "Lo que no siempre se pregunta",
    bloques: [
      {
        titulo: "Renovación",
        texto: "Si tu visa venció hace menos de 12 meses y es del mismo tipo, podrías calificar para renovar sin entrevista, dependiendo del consulado y tu perfil.",
      },
      {
        titulo: "Menores de edad",
        texto: "Ambos padres deben firmar la autorización correspondiente si el menor viaja sin alguno de ellos.",
      },
      {
        titulo: "Visa vencida o viajes frecuentes",
        texto: "Si ya venció, puedes aplicar de nuevo. Un buen historial de viajes anteriores, respetando tus tiempos de estancia, juega a tu favor.",
      },
      {
        titulo: "Al volver a aplicar",
        texto: "No repitas exactamente el mismo motivo por el que te rechazaron antes. Si algo cambió en tu situación, es momento de mostrarlo con evidencia.",
      },
      {
        titulo: "Evita fraudes",
        texto: "Desconfía de cualquiera que te \"asegure\" la visa o te ofrezca \"trucos\". Nadie puede garantizar el resultado — ni siquiera nosotros. Lo que sí te garantizamos es que tu trámite esté bien hecho, completo y sin errores.",
      },
    ],
    tip: "Si ya te rechazaron, fortalece tu perfil antes de volver a aplicar.",
  },
  {
    numero: 8,
    titulo: "Qué hacer después de obtener tu visa",
    subtitulo: "El trámite no termina al salir del consulado",
    bloques: [
      {
        titulo: "Después de aprobar",
        texto: "Tu visa se envía al centro de entrega (CAS) o a la dirección que indicaste. Puede tardar algunos días en llegar.",
      },
      {
        titulo: "Cómo leer tu visa",
        texto: "Verás tu nombre, número de pasaporte, tipo (B1/B2), y las fechas de emisión y vencimiento.",
      },
      {
        titulo: "Errores comunes",
        texto: [
          "Pensar que puedes quedarte el tiempo que quieras",
          "No respetar la fecha de salida que te indique el oficial de migración al entrar",
        ],
      },
      {
        titulo: "Tips para tu primer viaje",
        texto: "Lleva pasaporte, visa, boletos, reservas de hotel, y alguna evidencia de que vas a regresar (boleto de vuelta, comprobante laboral, etc.).",
      },
      {
        titulo: "Si pierdes tu visa o pasaporte",
        texto: "Repórtalo de inmediato al consulado más cercano, presenta tu denuncia y sigue el proceso de reposición.",
      },
      {
        titulo: "Cuida tu récord migratorio",
        texto: "Respetar los tiempos y las reglas de tu estancia facilita cualquier trámite futuro: renovaciones, otros tipos de visa, o la green card más adelante.",
      },
    ],
    tip: "Aunque ya tengas visa, al ingresar siempre confirma un plan de viaje claro y temporal con el oficial de migración.",
  },
];

export interface PreguntaEntrevista {
  numero: number;
  pregunta: string;
  preguntaIngles: string;
  buenaRespuesta: string;
  evitar: string;
}

export const PREGUNTAS_ENTREVISTA: PreguntaEntrevista[] = [
  {
    numero: 1,
    pregunta: "¿Cuál es el propósito de su viaje a Estados Unidos?",
    preguntaIngles: "What is the purpose of your trip to the United States?",
    buenaRespuesta: "Voy de vacaciones / turismo con mi familia por 10 días, para conocer [ciudad].",
    evitar: "Respuestas vagas (\"no sé, a pasear\") o mencionar cualquier intención de trabajar allá.",
  },
  {
    numero: 2,
    pregunta: "¿Cuánto tiempo piensa quedarse?",
    preguntaIngles: "How long are you planning to stay?",
    buenaRespuesta: "Da un número de días o semanas concreto y realista, alineado con tu boleto o reservación.",
    evitar: "\"No sé\" o plazos muy largos sin una razón clara que los justifique.",
  },
  {
    numero: 3,
    pregunta: "¿A qué se dedica? ¿En qué trabaja?",
    preguntaIngles: "What do you do for a living?",
    buenaRespuesta: "Descripción breve y clara de tu ocupación actual, con el nombre de tu empresa o negocio.",
    evitar: "Inventar un puesto o empresa que no puedas sostener si te preguntan más a fondo.",
  },
  {
    numero: 4,
    pregunta: "¿Quién paga el viaje?",
    preguntaIngles: "Who is paying for your trip?",
    buenaRespuesta: "Responde con la verdad: tú mismo, tus ahorros, o quien te esté invitando.",
    evitar: "Contradecir lo que ya declaraste en tu DS-160.",
  },
  {
    numero: 5,
    pregunta: "¿Con quién viaja?",
    preguntaIngles: "Who are you traveling with?",
    buenaRespuesta: "Menciona a las personas específicas — nombre y relación contigo — que te acompañan.",
    evitar: "Cambiar tu respuesta a media entrevista si te lo vuelven a preguntar.",
  },
  {
    numero: 6,
    pregunta: "¿Ha viajado antes a Estados Unidos o a otro país?",
    preguntaIngles: "Have you traveled to the U.S. or other countries before?",
    buenaRespuesta: "Menciona tus viajes previos y que siempre regresaste a tiempo — es una de tus mejores cartas.",
    evitar: "Ocultar viajes previos que ya aparecen en tu historial migratorio.",
  },
  {
    numero: 7,
    pregunta: "¿Tiene familiares en Estados Unidos?",
    preguntaIngles: "Do you have relatives in the United States?",
    buenaRespuesta: "Responde con honestidad. Tener familia allá no es un problema si tu caso es sólido.",
    evitar: "Negarlo si el oficial ya lo sabe por tus documentos — la inconsistencia pesa más que el hecho en sí.",
  },
  {
    numero: 8,
    pregunta: "¿Qué lo ata a regresar a su país?",
    preguntaIngles: "What ties you to your home country?",
    buenaRespuesta: "Menciona tu empleo, negocio, estudios, propiedades, o la familia que depende de ti.",
    evitar: "Quedarte callado o responder \"nada en especial\".",
  },
  {
    numero: 9,
    pregunta: "¿Por qué quiere ir precisamente ahora?",
    preguntaIngles: "Why do you want to travel at this specific time?",
    buenaRespuesta: "Da un motivo concreto: vacaciones familiares, un evento, temporada vacacional.",
    evitar: "Inventar un motivo sobre la marcha si no lo tenías pensado.",
  },
  {
    numero: 10,
    pregunta: "¿Planea trabajar en Estados Unidos?",
    preguntaIngles: "Do you plan to work in the United States?",
    buenaRespuesta: "\"No, mi visa es de turista / negocios, no para trabajar allá.\"",
    evitar: "Cualquier ambigüedad — es de las preguntas más sensibles de toda la entrevista.",
  },
];
