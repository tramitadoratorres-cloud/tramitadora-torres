"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { logActividad } from "@/lib/actividad";
import { ACTIVIDAD_TIPO } from "@/lib/constants";
import { SECCIONES_DS160 } from "@/lib/ds160-campos";

export interface FormularioDS160State {
  ok?: boolean;
  error?: string;
}

export async function guardarFormularioDS160Action(
  token: string,
  _prevState: FormularioDS160State,
  formData: FormData
): Promise<FormularioDS160State> {
  const caso = await db.caso.findUnique({ where: { tokenPublico: token } });
  if (!caso) {
    return { error: "No se encontró tu trámite. Revisa el link que te compartieron." };
  }

  const datos: Record<string, string> = {};
  for (const seccion of SECCIONES_DS160) {
    for (const campo of seccion.campos) {
      const valor = formData.get(campo.nombre);
      if (typeof valor === "string" && valor.trim() !== "") {
        datos[campo.nombre] = valor.trim();
      }
    }
  }

  const yaExistia = await db.formularioDS160.findUnique({ where: { casoId: caso.id } });

  await db.formularioDS160.upsert({
    where: { casoId: caso.id },
    create: { casoId: caso.id, datosJson: JSON.stringify(datos), enviado: true },
    update: { datosJson: JSON.stringify(datos), enviado: true },
  });

  await logActividad({
    casoId: caso.id,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: yaExistia
      ? "El cliente actualizó su forma DS-160"
      : "El cliente llenó su forma DS-160",
    visibleCliente: false,
  });

  revalidatePath(`/forma-ds160/${token}`);
  revalidatePath(`/crm/clientes/${caso.id}`);

  return { ok: true };
}
