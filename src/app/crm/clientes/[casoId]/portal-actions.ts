"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { logActividad } from "@/lib/actividad";
import { guardarArchivo, borrarArchivo, archivoMaxBytes } from "@/lib/storage";
import { ACTIVIDAD_TIPO } from "@/lib/constants";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const citaSchema = z.object({
  fecha: z.string().min(1, "Elige fecha y hora"),
  lugar: z.string().optional(),
  nota: z.string().optional(),
});

export async function crearCitaAction(
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = citaSchema.safeParse({
    fecha: formData.get("fecha"),
    lugar: formData.get("lugar"),
    nota: formData.get("nota"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const fecha = new Date(parsed.data.fecha);
  if (Number.isNaN(fecha.getTime())) {
    return { error: "La fecha no es válida" };
  }

  await db.cita.create({
    data: {
      casoId,
      fecha,
      lugar: parsed.data.lugar || "",
      nota: parsed.data.nota || "",
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: `${session.nombre} agendó una cita para el ${new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(fecha)}${parsed.data.lugar ? ` en ${parsed.data.lugar}` : ""}`,
    visibleCliente: true,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  return { ok: true };
}

export async function actualizarCitaAction(
  citaId: string,
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = citaSchema.safeParse({
    fecha: formData.get("fecha"),
    lugar: formData.get("lugar"),
    nota: formData.get("nota"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const fecha = new Date(parsed.data.fecha);
  if (Number.isNaN(fecha.getTime())) {
    return { error: "La fecha no es válida" };
  }

  await db.cita.update({
    where: { id: citaId },
    data: {
      fecha,
      lugar: parsed.data.lugar || "",
      nota: parsed.data.nota || "",
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: `${session.nombre} cambió una cita: ahora es el ${new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(fecha)}${parsed.data.lugar ? ` en ${parsed.data.lugar}` : ""}`,
    visibleCliente: true,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  return { ok: true };
}

export async function eliminarCitaAction(citaId: string, casoId: string) {
  await requireAgent();
  await db.cita.delete({ where: { id: citaId } });
  revalidatePath(`/crm/clientes/${casoId}`);
}

export async function subirArchivoAction(
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const file = formData.get("archivo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo" };
  }

  let guardado;
  try {
    guardado = await guardarArchivo(casoId, file);
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : `No se pudo guardar el archivo (máximo ${archivoMaxBytes() / 1024 / 1024} MB)`,
    };
  }

  await db.archivo.create({
    data: {
      casoId,
      nombre: guardado.nombre,
      rutaArchivo: guardado.rutaArchivo,
      mimeType: guardado.mimeType,
      tamano: guardado.tamano,
      subidoPorId: session.userId,
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: `${session.nombre} subió el archivo "${guardado.nombre}"`,
    visibleCliente: true,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  return { ok: true };
}

export async function subirArchivoCitaAction(
  casoId: string,
  citaId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const file = formData.get("archivo");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo" };
  }

  let guardado;
  try {
    guardado = await guardarArchivo(casoId, file);
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : `No se pudo guardar el archivo (máximo ${archivoMaxBytes() / 1024 / 1024} MB)`,
    };
  }

  await db.archivo.create({
    data: {
      casoId,
      citaId,
      nombre: guardado.nombre,
      rutaArchivo: guardado.rutaArchivo,
      mimeType: guardado.mimeType,
      tamano: guardado.tamano,
      subidoPorId: session.userId,
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: `${session.nombre} subió el archivo "${guardado.nombre}" a una cita`,
    visibleCliente: true,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  return { ok: true };
}

export async function eliminarArchivoAction(archivoId: string, casoId: string) {
  await requireAgent();
  const archivo = await db.archivo.findUniqueOrThrow({ where: { id: archivoId } });
  await borrarArchivo(archivo.rutaArchivo);
  await db.archivo.delete({ where: { id: archivoId } });
  revalidatePath(`/crm/clientes/${casoId}`);
}

export async function regenerarTokenAction(casoId: string) {
  await requireAgent();
  await db.caso.update({
    where: { id: casoId },
    data: { tokenPublico: randomUUID() },
  });
  revalidatePath(`/crm/clientes/${casoId}`);
}
