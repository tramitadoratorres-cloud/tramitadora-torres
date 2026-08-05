// Toda la operación es en Tijuana (Pacífico). El servidor puede correr en
// cualquier zona horaria (Railway suele usar UTC), así que nunca confiamos
// en la zona "local" del proceso: siempre convertimos explícitamente.
export const ZONA_HORARIA = "America/Tijuana";

/** Formatea una fecha en hora de Tijuana, sin importar la zona del servidor. */
export function formatFechaHora(
  fecha: Date,
  opciones: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: ZONA_HORARIA,
    ...opciones,
  }).format(fecha);
}

function offsetEnFecha(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA_HORARIA,
    timeZoneName: "longOffset",
  }).formatToParts(fecha);
  const gmt = partes.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  return gmt.replace("GMT", "") || "+00:00";
}

/**
 * Convierte el valor de un <input type="datetime-local"> (ej. "2026-08-10T14:00",
 * sin zona horaria) a un Date real, interpretando esos números como hora de
 * Tijuana — cambia sola entre horario de verano e invierno.
 */
export function parseFechaHoraLocal(valor: string): Date {
  const [fechaParte] = valor.split("T");
  // Punto de referencia a mediodía UTC del mismo día, solo para calcular el
  // offset de Tijuana en esa fecha exacta (por el horario de verano).
  const referencia = new Date(`${fechaParte}T12:00:00Z`);
  return new Date(`${valor}:00${offsetEnFecha(referencia)}`);
}

/** Formatea una fecha como valor para <input type="datetime-local">, en hora de Tijuana. */
export function toDatetimeLocalValue(fecha: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(fecha);
  const obtener = (tipo: string) =>
    partes.find((p) => p.type === tipo)?.value ?? "";
  return `${obtener("year")}-${obtener("month")}-${obtener("day")}T${obtener("hour")}:${obtener("minute")}`;
}

/** La fecha de hoy en Tijuana, como "YYYY-MM-DD". */
export function hoyTijuana(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Suma (o resta) días a una fecha "YYYY-MM-DD" con aritmética de calendario
 * pura (no le importa la zona horaria del servidor: solo mueve el número
 * de día).
 */
export function sumarDiasISO(fechaISO: string, dias: number): string {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado, para una fecha "YYYY-MM-DD" (aritmética de calendario pura). */
function diaSemanaISO(fechaISO: string): number {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** El lunes de la semana en curso (hora de Tijuana), como "YYYY-MM-DD". */
export function inicioSemanaTijuana(): string {
  const hoy = hoyTijuana();
  const dow = diaSemanaISO(hoy);
  const diasDesdeLunes = dow === 0 ? 6 : dow - 1;
  return sumarDiasISO(hoy, -diasDesdeLunes);
}

/** El primer día del mes en curso (hora de Tijuana), como "YYYY-MM-DD". */
export function inicioMesTijuana(): string {
  const hoy = hoyTijuana();
  return `${hoy.slice(0, 7)}-01`;
}
