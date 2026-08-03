"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, ORIGEN } from "@/lib/constants";

export interface LeadFormState {
  error?: string;
  ok?: boolean;
}

const schema = z.object({
  nombre: z.string().min(1, "Escribe tu nombre"),
  telefono: z.string().min(7, "Escribe un teléfono válido"),
  tramiteCatalogoId: z.string().optional(),
  mensaje: z.string().optional(),
});

export async function crearLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    tramiteCatalogoId: formData.get("tramiteCatalogoId"),
    mensaje: formData.get("mensaje"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const cliente = await db.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
    },
  });

  const caso = await db.caso.create({
    data: {
      clienteId: cliente.id,
      tramiteCatalogoId: parsed.data.tramiteCatalogoId || null,
      mensaje: parsed.data.mensaje || null,
      origen: ORIGEN.WEB,
    },
  });

  await logActividad({
    casoId: caso.id,
    tipo: ACTIVIDAD_TIPO.CREACION,
    descripcion: "Lead capturado desde el formulario del sitio público",
  });

  return { ok: true };
}
