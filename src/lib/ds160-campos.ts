export interface CampoDS160 {
  nombre: string;
  etiqueta: string;
  tipo: "text" | "tel" | "email" | "date" | "textarea" | "radio" | "checkbox";
  opciones?: string[];
}

export interface SeccionDS160 {
  titulo: string;
  nota?: string;
  campos: CampoDS160[];
}

export const SECCIONES_DS160: SeccionDS160[] = [
  {
    titulo: "1. Datos generales",
    campos: [
      { nombre: "nombreCompleto", etiqueta: "Nombre completo (como aparece en el pasaporte)", tipo: "text" },
      { nombre: "sexo", etiqueta: "Sexo", tipo: "radio", opciones: ["Hombre", "Mujer"] },
      { nombre: "fechaNacimiento", etiqueta: "Fecha de nacimiento", tipo: "date" },
      { nombre: "lugarNacimiento", etiqueta: "Lugar de nacimiento (Ciudad, Estado, País)", tipo: "text" },
      {
        nombre: "estadoCivil",
        etiqueta: "Estado civil",
        tipo: "radio",
        opciones: ["Soltero(a)", "Casado(a)", "Divorciado(a)", "Viudo(a)", "Unión libre"],
      },
      { nombre: "telefonoActual", etiqueta: "Teléfono actual", tipo: "tel" },
      { nombre: "telefonoAnterior", etiqueta: "Teléfono anterior (si cambió en los últimos 5 años)", tipo: "tel" },
      { nombre: "correoActual", etiqueta: "Correo electrónico actual", tipo: "email" },
      { nombre: "correoAnterior", etiqueta: "Correo anterior (si cambió en los últimos 5 años)", tipo: "email" },
      { nombre: "redesSociales", etiqueta: "Usuario en redes sociales (Facebook u otras)", tipo: "text" },
    ],
  },
  {
    titulo: "2. Domicilio actual",
    campos: [
      { nombre: "direccionCompleta", etiqueta: "Dirección completa con código postal", tipo: "textarea" },
      { nombre: "estadoPaisDomicilio", etiqueta: "Estado y país", tipo: "text" },
      {
        nombre: "presentaComprobanteDomicilio",
        etiqueta: "¿Desde este domicilio presentará comprobante?",
        tipo: "radio",
        opciones: ["Sí", "No"],
      },
    ],
  },
  {
    titulo: "3. Pasaporte",
    campos: [
      { nombre: "numeroPasaporte", etiqueta: "Número de pasaporte", tipo: "text" },
      { nombre: "paisEmisorPasaporte", etiqueta: "País emisor", tipo: "text" },
      { nombre: "fechaExpedicionPasaporte", etiqueta: "Fecha de expedición", tipo: "date" },
      { nombre: "fechaVencimientoPasaporte", etiqueta: "Fecha de vencimiento", tipo: "date" },
      {
        nombre: "pasaportePerdidoRobado",
        etiqueta: "¿Ha perdido o le han robado su pasaporte alguna vez?",
        tipo: "radio",
        opciones: ["Sí", "No"],
      },
      { nombre: "detallePasaportePerdido", etiqueta: "Si contestó que sí, cuéntanos brevemente qué pasó", tipo: "textarea" },
    ],
  },
  {
    titulo: "4. Tipo de solicitante",
    campos: [
      {
        nombre: "tipoSolicitante",
        etiqueta: "Tipo de solicitante",
        tipo: "radio",
        opciones: ["Mayor de edad", "Menor de edad"],
      },
    ],
  },
  {
    titulo: "5. Empleo actual",
    nota: "Solo para mayores de edad — si no aplica, puedes dejarla en blanco.",
    campos: [
      { nombre: "trabajaActualmente", etiqueta: "¿Trabaja actualmente?", tipo: "radio", opciones: ["Sí", "No"] },
      { nombre: "empresaActualNombre", etiqueta: "Nombre de la empresa", tipo: "text" },
      { nombre: "puestoActual", etiqueta: "Puesto o función", tipo: "text" },
      { nombre: "fechaIngresoEmpleoActual", etiqueta: "Fecha de ingreso", tipo: "date" },
      { nombre: "ingresoMensual", etiqueta: "Ingreso mensual comprobable", tipo: "text" },
      { nombre: "direccionTelefonoTrabajo", etiqueta: "Dirección y teléfono del trabajo", tipo: "textarea" },
    ],
  },
  {
    titulo: "6. Empleo anterior",
    nota: "Solo si aplica.",
    campos: [
      { nombre: "empresaAnteriorNombre", etiqueta: "Nombre de la empresa", tipo: "text" },
      { nombre: "puestoAnterior", etiqueta: "Puesto", tipo: "text" },
      { nombre: "fechaIngresoEmpleoAnterior", etiqueta: "Fecha de ingreso", tipo: "date" },
      { nombre: "fechaSalidaEmpleoAnterior", etiqueta: "Fecha de salida", tipo: "date" },
    ],
  },
  {
    titulo: "7. Estado civil (cónyuge)",
    nota: "Solo si está o estuvo casado(a).",
    campos: [
      { nombre: "nombreConyuge", etiqueta: "Nombre del cónyuge", tipo: "text" },
      { nombre: "nacimientoConyuge", etiqueta: "Fecha y lugar de nacimiento del cónyuge", tipo: "text" },
      { nombre: "ocupacionConyuge", etiqueta: "Ocupación del cónyuge", tipo: "text" },
      { nombre: "datosExConyuge", etiqueta: "Datos del ex-cónyuge (si es divorciado)", tipo: "textarea" },
      { nombre: "fechaMatrimonio", etiqueta: "Fecha de matrimonio", tipo: "date" },
      { nombre: "fechaDivorcio", etiqueta: "Fecha de divorcio", tipo: "date" },
      { nombre: "lugarMotivoDivorcio", etiqueta: "Lugar y motivo del divorcio", tipo: "textarea" },
    ],
  },
  {
    titulo: "8. Padres",
    nota: "Solo para menores de edad.",
    campos: [
      { nombre: "padreNombreAnio", etiqueta: "Nombre completo del padre y año de nacimiento", tipo: "text" },
      { nombre: "madreNombreAnio", etiqueta: "Nombre completo de la madre y año de nacimiento", tipo: "text" },
    ],
  },
  {
    titulo: "9. Familiares en Estados Unidos",
    campos: [
      { nombre: "tieneFamiliaresEEUU", etiqueta: "¿Tiene familiares directos en EE.UU.?", tipo: "radio", opciones: ["Sí", "No"] },
      { nombre: "datosFamiliaresEEUU", etiqueta: "Nombre completo, parentesco y estatus migratorio", tipo: "textarea" },
    ],
  },
  {
    titulo: "10. Historial migratorio",
    campos: [
      { nombre: "haVisitadoEEUU", etiqueta: "¿Ha visitado EE.UU. anteriormente?", tipo: "radio", opciones: ["Sí", "No"] },
      { nombre: "fechaUltimaVisitaEEUU", etiqueta: "Fecha aproximada de la última visita", tipo: "date" },
      { nombre: "tipoVisaAnterior", etiqueta: "Tipo de visa anterior (si aplica)", tipo: "text" },
    ],
  },
  {
    titulo: "11. Estudios",
    campos: [
      { nombre: "nivelEstudios", etiqueta: "Nivel máximo de estudios", tipo: "text" },
      { nombre: "tieneTitulo", etiqueta: "¿Cuenta con título?", tipo: "radio", opciones: ["Sí", "No"] },
      { nombre: "institucionEstudios", etiqueta: "Nombre de la institución", tipo: "text" },
      { nombre: "fechaIngresoEstudios", etiqueta: "Fecha de ingreso", tipo: "date" },
      { nombre: "fechaEgresoEstudios", etiqueta: "Fecha de egreso", tipo: "date" },
      { nombre: "direccionTelefonoInstitucion", etiqueta: "Dirección y teléfono de la institución", tipo: "textarea" },
    ],
  },
  {
    titulo: "12. Confirmación",
    campos: [
      { nombre: "declaraVeracidad", etiqueta: "Declaro que la información proporcionada es verdadera", tipo: "checkbox" },
      {
        nombre: "autorizaUso",
        etiqueta: "Autorizo a Tramitadora Torres a utilizar estos datos para el trámite DS-160",
        tipo: "checkbox",
      },
      { nombre: "observaciones", etiqueta: "Observaciones adicionales", tipo: "textarea" },
    ],
  },
];
