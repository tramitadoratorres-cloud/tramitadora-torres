"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, ORIGEN } from "@/lib/constants";

export interface FormState {
  error?: string;
}

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email().optional().or(z.literal("")),
  mensaje: z.string().optional(),
});

export async function crearClienteAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    mensaje: formData.get("mensaje"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const cliente = await db.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
    },
  });

  const caso = await db.caso.create({
    data: {
      clienteId: cliente.id,
      mensaje: parsed.data.mensaje || null,
      origen: ORIGEN.MANUAL,
    },
  });

  await logActividad({
    casoId: caso.id,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.CREACION,
    descripcion: `${session.nombre} agregó a ${cliente.nombre} manualmente al CRM`,
  });

  redirect(`/crm/clientes/${caso.id}`);
}
