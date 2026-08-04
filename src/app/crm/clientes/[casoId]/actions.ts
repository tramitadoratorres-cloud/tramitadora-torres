"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, formatMXN } from "@/lib/constants";
import { avanzarEtapaSiAplica, generarReciboSiFalta } from "@/lib/recibo-helper";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const asignarSchema = z.object({
  tramiteCatalogoId: z.string().min(1),
  precioCobrado: z.coerce.number().int().min(0, "El precio no puede ser negativo"),
  motivoAjuste: z.string().optional(),
});

export async function asignarTramiteAction(
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = asignarSchema.safeParse({
    tramiteCatalogoId: formData.get("tramiteCatalogoId"),
    precioCobrado: formData.get("precioCobrado"),
    motivoAjuste: formData.get("motivoAjuste"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const tramite = await db.tramiteCatalogo.findUniqueOrThrow({
    where: { id: parsed.data.tramiteCatalogoId },
  });

  const caso = await db.caso.findUniqueOrThrow({ where: { id: casoId } });
  const huboAjuste = parsed.data.precioCobrado !== tramite.honorarioBase;

  await db.caso.update({
    where: { id: casoId },
    data: {
      tramiteCatalogoId: tramite.id,
      precioCobrado: parsed.data.precioCobrado,
      motivoAjuste: parsed.data.motivoAjuste || null,
      etapa: caso.etapa === "NUEVO_CONTACTO" ? "COTIZADO" : caso.etapa,
    },
  });

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.TRAMITE_ASIGNADO,
    descripcion: `${session.nombre} cotizó "${tramite.nombre}" por ${formatMXN(parsed.data.precioCobrado)}${
      huboAjuste ? ` (honorario base ${formatMXN(tramite.honorarioBase)}${parsed.data.motivoAjuste ? `, motivo: ${parsed.data.motivoAjuste}` : ""})` : ""
    }`,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath("/crm");
  return { ok: true };
}

export async function marcarDocumentosAction(casoId: string) {
  const session = await requireAgent();
  await db.caso.update({
    where: { id: casoId },
    data: { documentosRecibidos: true },
  });
  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.DOCUMENTOS_RECIBIDOS,
    descripcion: `${session.nombre} marcó los documentos como recibidos`,
  });
  await avanzarEtapaSiAplica(casoId);
  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath("/crm");
}

export async function marcarPagoAction(casoId: string) {
  const session = await requireAgent();
  await db.caso.update({
    where: { id: casoId },
    data: { pagado: true, fechaPago: new Date() },
  });
  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.PAGO_RECIBIDO,
    descripcion: `${session.nombre} registró el pago del honorario`,
  });
  await avanzarEtapaSiAplica(casoId);
  await generarReciboSiFalta(casoId, session.userId);
  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath("/crm");
}

const notaSchema = z.object({
  nota: z.string().min(1, "Escribe una nota"),
  visibleCliente: z.coerce.boolean().optional(),
});

export async function agregarNotaAction(
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = notaSchema.safeParse({
    nota: formData.get("nota"),
    visibleCliente: formData.get("visibleCliente") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nota inválida" };
  }

  await logActividad({
    casoId,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: parsed.data.nota,
    visibleCliente: parsed.data.visibleCliente,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  return { ok: true };
}

const agregarTramiteExpedienteSchema = z.object({
  tramiteCatalogoId: z.string().min(1, "Selecciona un trámite"),
  precioCobrado: z.coerce.number().int().min(0, "El precio no puede ser negativo"),
  paraQuien: z.string().optional(),
});

// Crea un Caso hermano dentro del mismo expediente familiar — ej. el mismo
// contacto que ya tiene un trámite en el CRM ahora también necesita
// tramitar el pasaporte de su cónyuge o de un hijo.
export async function agregarTramiteExpedienteAction(
  casoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireAgent();
  const parsed = agregarTramiteExpedienteSchema.safeParse({
    tramiteCatalogoId: formData.get("tramiteCatalogoId"),
    precioCobrado: formData.get("precioCobrado"),
    paraQuien: formData.get("paraQuien"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const casoOrigen = await db.caso.findUniqueOrThrow({ where: { id: casoId } });
  const tramite = await db.tramiteCatalogo.findUniqueOrThrow({
    where: { id: parsed.data.tramiteCatalogoId },
  });
  const paraQuien = parsed.data.paraQuien?.trim() || null;

  const nuevoCaso = await db.caso.create({
    data: {
      clienteId: casoOrigen.clienteId,
      expedienteId: casoOrigen.expedienteId,
      paraQuien,
      tramiteCatalogoId: tramite.id,
      precioCobrado: parsed.data.precioCobrado,
      origen: casoOrigen.origen,
      etapa: "COTIZADO",
    },
  });

  await logActividad({
    casoId: nuevoCaso.id,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.CREACION,
    descripcion: `${session.nombre} agregó "${tramite.nombre}"${
      paraQuien ? ` para ${paraQuien}` : ""
    } al expediente familiar`,
  });

  revalidatePath(`/crm/clientes/${casoId}`);
  revalidatePath(`/crm/clientes/${nuevoCaso.id}`);
  revalidatePath("/crm");
  return { ok: true };
}

export async function generarReciboAction(casoId: string) {
  const session = await requireAgent();
  const caso = await db.caso.findUniqueOrThrow({ where: { id: casoId } });

  if (caso.precioCobrado == null) {
    throw new Error("El caso todavía no tiene un precio cobrado asignado");
  }
  if (!caso.pagado) {
    throw new Error("El caso todavía no tiene el pago marcado como recibido");
  }

  const recibo = await generarReciboSiFalta(casoId, session.userId);
  revalidatePath(`/crm/clientes/${casoId}`);
  return recibo!.id;
}
