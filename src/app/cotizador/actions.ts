"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  calcularCotizacionMultiple,
  MAX_PARTIDAS,
  type ConfiguracionCotizacion,
} from "@/lib/cotizador";

export type CotizadorState = {
  error?: string;
  ok?: boolean;
  token?: string;
};

const partidaSchema = z.object({
  tramite: z.enum(["PASAPORTE_MX", "PASAPORTE_US", "VISA_B12", "SENTRI", "PAQUETE_PASAPORTE_VISA"]),
  adultos: z.coerce.number().int().min(0).max(999),
  menores: z.coerce.number().int().min(0).max(999),
  vigenciaPasaporte: z.union([z.literal(3), z.literal(6), z.literal(10)]).optional(),
  documentoAdultoUS: z.enum(["LIBRETA", "TARJETA", "AMBOS"]).optional(),
  documentoMenorUS: z.enum(["LIBRETA", "TARJETA", "AMBOS"]).optional(),
  modalidadAdultoUS: z.enum(["PRIMERA_VEZ", "RENOVACION"]).optional(),
});

const schema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre completo."),
  telefono: z.string().trim().min(7, "Escribe un celular válido."),
  email: z.string().trim().email("Escribe un correo válido."),
  partidas: z.array(partidaSchema).min(1, "Agrega al menos un trámite.").max(MAX_PARTIDAS),
});

export async function guardarCotizacionAction(
  _prevState: CotizadorState,
  formData: FormData
): Promise<CotizadorState> {
  let partidasCrudas: unknown = [];
  try {
    partidasCrudas = JSON.parse(String(formData.get("partidas") ?? "[]"));
  } catch {}

  const parsed = schema.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    email: formData.get("email"),
    partidas: partidasCrudas,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la cotización." };
  }

  try {
    const partidas: ConfiguracionCotizacion[] = parsed.data.partidas;
    const calculada = calcularCotizacionMultiple(partidas);

    const cotizacion = await db.cotizacion.create({
      data: {
        tipo: partidas.length === 1 ? partidas[0].tramite : "MULTIPLE",
        adultos: calculada.adultos,
        menores: calculada.menores,
        configuracionJson: JSON.stringify({ partidas }),
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
