import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { leerArchivo } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ archivoId: string }> }
) {
  const { archivoId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  const archivo = await db.archivo.findUnique({
    where: { id: archivoId },
    include: { caso: true },
  });

  if (!archivo) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const session = await getSession();
  const autorizado =
    Boolean(session.userId) ||
    (Boolean(token) && token === archivo.caso.tokenPublico);
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const bytes = await leerArchivo(archivo.rutaArchivo).catch(() => null);
  if (!bytes) {
    return NextResponse.json({ error: "El archivo ya no está disponible" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": archivo.mimeType,
      "Content-Disposition": `inline; filename="${archivo.nombre.replace(/"/g, "")}"`,
    },
  });
}
