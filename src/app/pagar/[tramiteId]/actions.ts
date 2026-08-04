"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, ORIGEN } from "@/lib/constants";

export interface CheckoutFormState {
  error?: string;
}

const schema = z.object({
  nombre: z.string().min(1, "Escribe tu nombre"),
  telefono: z.string().min(7, "Escribe un teléfono válido"),
  email: z.string().email("Escribe un correo válido"),
});

export async function crearPagoAction(
  tramiteId: string,
  _prevState: CheckoutFormState,
  formData: FormData
): Promise<CheckoutFormState> {
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const tramite = await db.tramiteCatalogo.findUnique({
    where: { id: tramiteId },
  });
  if (!tramite || !tramite.activo) {
    return { error: "Este trámite ya no está disponible." };
  }

  if (!tramite.linkPago) {
    return {
      error:
        "El pago en línea todavía no está configurado para este trámite. Escríbenos por WhatsApp y con gusto te ayudamos a cotizar y pagar.",
    };
  }

  const cliente = await db.cliente.create({
    data: {
      nombre: parsed.data.nombre,
      telefono: parsed.data.telefono,
      email: parsed.data.email,
    },
  });

  const caso = await db.caso.create({
    data: {
      clienteId: cliente.id,
      tramiteCatalogoId: tramite.id,
      precioCobrado: tramite.honorarioBase,
      origen: ORIGEN.WEB_PAGO,
    },
  });

  await logActividad({
    casoId: caso.id,
    tipo: ACTIVIDAD_TIPO.CREACION,
    descripcion: `Cliente inició pago en línea de "${tramite.nombre}" por ${tramite.honorarioBase} MXN`,
  });

  // Stripe Payment Link: se crea manualmente en el dashboard de Stripe (sin
  // llamadas a su API desde nuestro servidor). client_reference_id viaja en
  // la URL y Stripe lo reenvía tal cual en el webhook checkout.session.completed,
  // así sabemos a qué caso corresponde el pago.
  const url = new URL(tramite.linkPago);
  url.searchParams.set("client_reference_id", caso.id);
  url.searchParams.set("prefilled_email", parsed.data.email);

  redirect(url.toString());
}
