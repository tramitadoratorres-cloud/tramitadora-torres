"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { TRAMITE_ICONOS } from "@/components/tramite-icons";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const tramiteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional(),
  badge: z.string().optional(),
  honorarioBase: z.coerce.number().int().min(0),
  requisitos: z.string().optional(),
  destacado: z.coerce.boolean().optional(),
  icono: z.enum(Object.keys(TRAMITE_ICONOS) as [string, ...string[]]).optional(),
  linkPago: z
    .string()
    .trim()
    .refine((v) => v === "" || z.string().url().safeParse(v).success, {
      message: "El link de pago debe ser una URL válida (o déjalo vacío)",
    })
    .optional(),
});

export async function actualizarTramiteAction(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAgent();
  const parsed = tramiteSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    badge: formData.get("badge"),
    honorarioBase: formData.get("honorarioBase"),
    requisitos: formData.get("requisitos"),
    destacado: formData.get("destacado") === "on",
    icono: formData.get("icono"),
    linkPago: formData.get("linkPago"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await db.tramiteCatalogo.update({
    where: { id },
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion ?? "",
      badge: parsed.data.badge ?? "",
      honorarioBase: parsed.data.honorarioBase,
      requisitos: parsed.data.requisitos ?? "",
      destacado: parsed.data.destacado ?? false,
      icono: parsed.data.icono ?? "documento",
      linkPago: parsed.data.linkPago ?? "",
    },
  });

  revalidatePath("/crm/catalogo");
  revalidatePath("/");
  return { ok: true };
}

export async function alternarActivoAction(id: string) {
  await requireAgent();
  const tramite = await db.tramiteCatalogo.findUniqueOrThrow({ where: { id } });
  await db.tramiteCatalogo.update({
    where: { id },
    data: { activo: !tramite.activo },
  });
  revalidatePath("/crm/catalogo");
  revalidatePath("/");
}

export async function crearTramiteAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAgent();
  const parsed = tramiteSchema.safeParse({
    nombre: formData.get("nombre"),
    descripcion: formData.get("descripcion"),
    badge: formData.get("badge"),
    honorarioBase: formData.get("honorarioBase"),
    requisitos: formData.get("requisitos"),
    destacado: formData.get("destacado") === "on",
    icono: formData.get("icono"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const total = await db.tramiteCatalogo.count();
  await db.tramiteCatalogo.create({
    data: {
      nombre: parsed.data.nombre,
      descripcion: parsed.data.descripcion ?? "",
      badge: parsed.data.badge ?? "",
      honorarioBase: parsed.data.honorarioBase,
      requisitos: parsed.data.requisitos ?? "",
      destacado: parsed.data.destacado ?? false,
      icono: parsed.data.icono ?? "documento",
      orden: total + 1,
    },
  });

  revalidatePath("/crm/catalogo");
  revalidatePath("/");
  return { ok: true };
}
