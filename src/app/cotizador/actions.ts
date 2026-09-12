"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  calcularCotizacion,
  type ConfiguracionCotizacion,
  type CotizadorTramiteId,
  type DocumentoUS,
  type ModalidadAdultoUS,
} from "@/lib/cotizador";

export type CotizadorState = {
  error?: string;
  ok?: boolean;
  token?: string;
};

const schema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre completo."),
  telefono: z.string().trim().min(7, "Escribe un celular válido."),
  email: z.string().trim().email("Escribe un correo válido."),
  tramite: z.enum(["PASAPORTE_MX", "PASAPORTE_US", "VISA_B12", "SENTRI", "PAQUETE_PASAPORTE_VISA"]),
  adultos: z.coerce.number().int().min(0).max(3),
  menores: z.coerce.number().int().min(0).max(3),
  vigenciaPasaporte: z.coerce.number().int().optional(),
  documentoAdultoUS: z.enum(["LIBRETA", "TARJETA", "AMBOS"]).optional(),
  documentoMenorUS: z.enum(["LIBRETA", "TARJETA", "AMBOS"]).optional(),
  modalidadAdultoUS: z.enum(["PRIMERA_VEZ", "RENOVACION"]).optional(),
});

export async function guardarCotizacionAction(
  _prevState: CotizadorState,
  formData: FormData
): Promise<CotizadorState> {
  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    tramite: formData.get("tramite"),
    adultos: formData.get("adultos"),
    menores: formData.get("menores"),
    vigenciaPasaporte: formData.get("vigenciaPasaporte") || undefined,
    documentoAdultoUS: formData.get("documentoAdultoUS") || undefined,
    documentoMenorUS: formData.get("documentoMenorUS") || undefined,
    modalidadAdultoUS: formData.get("modalidadAdultoUS") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cotización." };
  }

  try {
    const config: ConfiguracionCotizacion = {
      tramite: parsed.data.tramite as CotizadorTramiteId,
      adultos: parsed.data.adultos,
      menores: parsed.data.menores,
      vigenciaPasaporte: parsed.data.vigenciaPasaporte as 3 | 6 | 10 | undefined,
      documentoAdultoUS: parsed.data.documentoAdultoUS as DocumentoUS | undefined,
      documentoMenorUS: parsed.data.documentoMenorUS as DocumentoUS | undefined,
      modalidadAdultoUS: parsed.data.modalidadAdultoUS as ModalidadAdultoUS | undefined,
    };
    const calculada = calcularCotizacion(config);

    const cotizacion = await db.cotizacion.create({
      data: {
        tipo: config.tramite,
        adultos: calculada.adultos,
        menores: calculada.menores,
        configuracionJson: JSON.stringify(config),
        honorariosMXN: calculada.honorariosMXN,
        derechosMXN: calculada.derechosMXN,
        derechosUSD: calculada.derechosUSD,
        totalMXN: calculada.totalMXN,
        nombre: parsed.data.nombre,
        telefono: parsed.data.telefono,
        email: parsed.data.email,
      },
    });

    return { ok: true, token: cotizacion.token };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo guardar tu cotización. Intenta de nuevo.",
    };
  }
}
