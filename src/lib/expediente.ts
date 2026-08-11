import "server-only";
import { db } from "@/lib/db";

/**
 * El caso más antiguo de un expediente es el "principal": su ticket
 * (tokenPublico) es el único que se comparte con el cliente. Los demás
 * trámites que se agreguen al mismo expediente (ej. el de su pareja o un
 * hijo) no generan un ticket aparte — se ven desde el mismo, en "otros
 * trámites de tu expediente".
 */
export async function casoPrincipalDeExpediente(expedienteId: string) {
  return db.caso.findFirstOrThrow({
    where: { expedienteId },
    orderBy: { createdAt: "asc" },
    select: { id: true, tokenPublico: true },
  });
}
