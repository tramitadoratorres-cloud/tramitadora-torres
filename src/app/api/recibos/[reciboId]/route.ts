import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateReceiptPdf } from "@/lib/receipts";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reciboId: string }> }
) {
  const { reciboId } = await params;
  const token = new URL(request.url).searchParams.get("token");

  const recibo = await db.recibo.findUnique({
    where: { id: reciboId },
    include: {
      caso: { include: { cliente: true, tramiteCatalogo: true } },
      generadoPor: true,
    },
  });

  if (!recibo) {
    return NextResponse.json({ error: "Recibo no encontrado" }, { status: 404 });
  }

  // Acceso permitido a un agente con sesión, o a quien traiga el token
  // privado del ticket virtual del cliente dueño de este recibo.
  const session = await getSession();
  const autorizado =
    Boolean(session.userId) ||
    (Boolean(token) && token === recibo.caso.tokenPublico);
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const pdfBytes = await generateReceiptPdf({
    folio: recibo.folio,
    fecha: recibo.createdAt,
    clienteNombre: recibo.caso.cliente.nombre,
    clienteTelefono: recibo.caso.cliente.telefono,
    tramiteNombre: recibo.caso.tramiteCatalogo?.nombre ?? "Trámite de gestoría",
    monto: recibo.monto,
    motivoAjuste: recibo.motivoAjuste,
    agenteNombre: recibo.generadoPor?.nombre,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-${String(recibo.folio).padStart(5, "0")}.pdf"`,
    },
  });
}
