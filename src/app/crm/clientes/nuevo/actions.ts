"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
import { logActividad } from "@/lib/actividad";
import { avanzarEtapaSiAplica, generarReciboSiFalta } from "@/lib/recibo-helper";
import { ACTIVIDAD_TIPO, ORIGEN, formatMXN } from "@/lib/constants";

export interface FormState {
  error?: string;
}

const schema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  email: z.string().email().optional().or(z.literal("")),
  mensaje: z.string().optional(),
  tramiteCatalogoId: z.string().optional(),
  precioCobrado: z.preprocess(
    (val) => (val === "" || val == null ? undefined : val),
    z.coerce.number().int().min(0).optional()
  ),
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
    tramiteCatalogoId: formData.get("tramiteCatalogoId"),
    precioCobrado: formData.get("precioCobrado"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  // Checkbox: solo llega en el FormData si está marcado ("on").
  const yaPago = formData.get("yaPago") === "on";

  const tramite = parsed.data.tramiteCatalogoId
    ? await db.tramiteCatalogo.findUnique({ where: { id: parsed.data.tramiteCatalogoId } })
    : null;

  const precioCobrado = parsed.data.precioCobrado ?? tramite?.honorarioBase ?? null;

  if (yaPago && precioCobrado == null) {
    return {
      error: "Para marcar el pago indica el trámite o el precio cotizado",
    };
  }

  const cliente = await db.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email || null,
    },
  });

  const expediente = await db.expediente.create({
    data: { clienteId: cliente.id },
  });

  const caso = await db.caso.create({
    data: {
      clienteId: cliente.id,
      expedienteId: expediente.id,
      mensaje: parsed.data.mensaje || null,
      origen: ORIGEN.MANUAL,
      tramiteCatalogoId: tramite?.id ?? null,
      precioCobrado,
      pagado: yaPago,
      fechaPago: yaPago ? new Date() : null,
      etapa: tramite ? "COTIZADO" : "NUEVO_CONTACTO",
    },
  });

  await logActividad({
    casoId: caso.id,
    userId: session.userId,
    tipo: ACTIVIDAD_TIPO.CREACION,
    descripcion: `${session.nombre} agregó a ${cliente.nombre} manualmente al CRM`,
  });

  if (tramite) {
    await logActividad({
      casoId: caso.id,
      userId: session.userId,
      tipo: ACTIVIDAD_TIPO.TRAMITE_ASIGNADO,
      descripcion: `${session.nombre} asignó "${tramite.nombre}" por ${formatMXN(
        caso.precioCobrado ?? tramite.honorarioBase
      )}`,
    });
  }

  if (yaPago) {
    await logActividad({
      casoId: caso.id,
      userId: session.userId,
      tipo: ACTIVIDAD_TIPO.PAGO_RECIBIDO,
      descripcion: `${session.nombre} registró el pago de ${formatMXN(precioCobrado!)} al crear el cliente`,
    });
    await avanzarEtapaSiAplica(caso.id);
    await generarReciboSiFalta(caso.id, session.userId);
  }

  redirect(`/crm/clientes/${caso.id}`);
}
