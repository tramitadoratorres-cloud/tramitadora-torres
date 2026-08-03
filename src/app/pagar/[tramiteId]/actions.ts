"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO, ORIGEN } from "@/lib/constants";
import { crearSesionPago, stripeConfigurado } from "@/lib/stripe";

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
  if (!stripeConfigurado()) {
    return {
      error:
        "El pago en línea todavía no está configurado. Escríbenos por WhatsApp y con gusto te ayudamos a cotizar y pagar tu trámite.",
    };
  }

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

  let checkoutUrl: string | null;
  try {
    const sesion = await crearSesionPago({
      casoId: caso.id,
      tramiteNombre: tramite.nombre,
      monto: tramite.honorarioBase,
      clienteEmail: parsed.data.email,
    });
    checkoutUrl = sesion.url;
    await db.caso.update({
      where: { id: caso.id },
      data: { pagoPreferenciaId: sesion.id },
    });
  } catch {
    return {
      error:
        "No se pudo iniciar el pago con Stripe. Intenta de nuevo o escríbenos por WhatsApp.",
    };
  }

  if (!checkoutUrl) {
    return {
      error: "No se pudo iniciar el pago. Intenta de nuevo o escríbenos por WhatsApp.",
    };
  }

  redirect(checkoutUrl);
}
