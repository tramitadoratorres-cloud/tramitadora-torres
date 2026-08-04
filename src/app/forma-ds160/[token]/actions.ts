"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAgent } from "@/lib/session";
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
  const formulario = await db.formularioDS160.findUnique({ where: { token } });
  if (!formulario) {
    return { error: "No se encontró este cuestionario. Revisa el link que te compartieron." };
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

  await db.formularioDS160.update({
    where: { token },
    data: { datosJson: JSON.stringify(datos), enviado: true },
  });

  await logActividad({
    casoId: formulario.casoId,
    tipo: ACTIVIDAD_TIPO.NOTA,
    descripcion: formulario.enviado
      ? `Se actualizó un cuestionario DS-160 (${datos.nombreCompleto ?? "sin nombre aún"})`
      : `Se llenó un cuestionario DS-160 (${datos.nombreCompleto ?? "sin nombre aún"})`,
    visibleCliente: false,
  });

  revalidatePath(`/forma-ds160/${token}`);
  revalidatePath(`/crm/clientes/${formulario.casoId}`);

  return { ok: true };
}

export async function crearFormularioDS160Action(casoId: string) {
  await requireAgent();
  await db.formularioDS160.create({ data: { casoId } });
  revalidatePath(`/crm/clientes/${casoId}`);
}

export async function eliminarFormularioDS160Action(id: string, casoId: string) {
  await requireAgent();
  await db.formularioDS160.delete({ where: { id } });
  revalidatePath(`/crm/clientes/${casoId}`);
}
