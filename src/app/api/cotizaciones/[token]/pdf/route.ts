import { NextResponse } from "next/server";
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";
import { calcularCotizacionMultiple, formatUSD, partidasDeConfiguracion, type ConfiguracionCotizacion } from "@/lib/cotizador";
import { formatMXN } from "@/lib/constants";

export const runtime = "nodejs";

function drawLine(page: PDFPage, text: string, x: number, y: number, font: PDFFont, size = 9) {
  page.drawText(text, { x, y, size, font, color: rgb(0.12, 0.17, 0.27) });
}

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = await db.cotizacion.findUnique({ where: { token } });
  if (!quote) return new NextResponse("Cotización no encontrada", { status: 404 });

  let partidas: ConfiguracionCotizacion[];
  try {
    partidas = partidasDeConfiguracion(quote.configuracionJson);
  } catch {
    return new NextResponse("Cotización inválida", { status: 500 });
  }
  let result: ReturnType<typeof calcularCotizacionMultiple>;
  try {
    result = calcularCotizacionMultiple(partidas);
  } catch {
    return new NextResponse("Cotización inválida", { status: 500 });
  }
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([612, 792]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const navy = rgb(0.06, 0.12, 0.22);

  page.drawRectangle({ x: 0, y: 708, width: 612, height: 84, color: navy });
  page.drawText("TRAMITADORA TORRES", { x: 42, y: 753, size: 19, font: bold, color: rgb(1, 1, 1) });
  page.drawText("Cotización de trámite", { x: 42, y: 731, size: 11, font: regular, color: rgb(0.88, 0.78, 0.48) });
  drawLine(page, `Folio: ${quote.token.slice(-8).toUpperCase()}  ·  ${quote.createdAt.toLocaleDateString("es-MX")}`, 42, 678, regular);
  drawLine(page, quote.nombre, 42, 650, bold, 15);
  drawLine(page, `${quote.telefono}  ·  ${quote.email}`, 42, 634, regular);
  const titulo = result.partidas.length > 1 ? "Cotización de varios trámites" : result.nombre;
  drawLine(page, titulo, 42, 594, bold, 16);
  drawLine(page, `${result.adultos} adulto(s) · ${result.menores} menor(es) · ${result.personas} persona(s)`, 42, 576, regular);

  let y = 540;
  // Si el contenido no cabe, continúa en una página nueva.
  const asegurarEspacio = (necesario: number) => {
    if (y - necesario < 60) {
      page = pdf.addPage([612, 792]);
      y = 740;
    }
  };
  if (result.partidas.length > 1) {
    page.drawText("TRÁMITES INCLUIDOS", { x: 42, y, size: 10, font: bold, color: rgb(0.54, 0.42, 0.15) });
    y -= 20;
    for (const partida of result.partidas) {
      asegurarEspacio(18);
      drawLine(page, `${partida.tramite.nombre}: ${partida.adultos} adulto(s) · ${partida.menores} menor(es)`, 42, y, regular, 9);
      y -= 16;
    }
    y -= 20;
  }
  page.drawText("DESGLOSE", { x: 42, y, size: 10, font: bold, color: rgb(0.54, 0.42, 0.15) });
  y -= 24;
  for (const line of result.lineas) {
    asegurarEspacio(18);
    const total = line.monto * line.cantidad;
    drawLine(page, `${line.cantidad} × ${line.etiqueta}`, 42, y, regular, 8.5);
    const amount = line.moneda === "MXN" ? formatMXN(total) : formatUSD(total);
    page.drawText(amount, { x: 492 - regular.widthOfTextAtSize(amount, 8.5), y, size: 8.5, font: regular, color: navy });
    y -= 18;
  }
  asegurarEspacio(170);
  y -= 8;
  page.drawLine({ start: { x: 42, y }, end: { x: 570, y }, thickness: 0.7, color: rgb(0.7, 0.68, 0.62) });
  y -= 24;
  drawLine(page, "Honorarios de gestoría", 42, y, bold, 10);
  page.drawText(formatMXN(result.honorariosMXN), { x: 570 - bold.widthOfTextAtSize(formatMXN(result.honorariosMXN), 10), y, size: 10, font: bold, color: navy });
  y -= 20;
  drawLine(page, "Derechos oficiales en MXN", 42, y, regular, 10);
  page.drawText(formatMXN(result.derechosMXN), { x: 570 - regular.widthOfTextAtSize(formatMXN(result.derechosMXN), 10), y, size: 10, font: regular, color: navy });
  if (result.derechosUSD) {
    y -= 20;
    drawLine(page, "Derechos oficiales en USD", 42, y, regular, 10);
    page.drawText(formatUSD(result.derechosUSD), { x: 570 - regular.widthOfTextAtSize(formatUSD(result.derechosUSD), 10), y, size: 10, font: regular, color: navy });
    y -= 20;
    drawLine(page, "Equivalente de USD en MXN", 42, y, regular, 10);
    page.drawText(formatMXN(result.derechosUSDEnMXN), { x: 570 - regular.widthOfTextAtSize(formatMXN(result.derechosUSDEnMXN), 10), y, size: 10, font: regular, color: navy });
  }
  y -= 30;
  page.drawRectangle({ x: 42, y: y - 14, width: 528, height: 38, color: rgb(0.93, 0.89, 0.78) });
  drawLine(page, "Total estimado en MXN", 55, y, bold, 11);
  page.drawText(formatMXN(result.totalMXN), { x: 557 - bold.widthOfTextAtSize(formatMXN(result.totalMXN), 13), y: y - 1, size: 13, font: bold, color: navy });
  y -= 58;
  asegurarEspacio(60 + result.requisitos.length * 15);
  page.drawText("REQUISITOS PARA INICIAR", { x: 42, y, size: 10, font: bold, color: rgb(0.54, 0.42, 0.15) });
  y -= 18;
  for (const requirement of result.requisitos) {
    drawLine(page, `• ${requirement}`, 42, y, regular, 8.5);
    y -= 15;
  }
  y -= 12;
  drawLine(page, "USD convertidos a MXN con tipo de cambio de referencia; el cobro oficial puede variar al pagar.", 42, y, regular, 7.5);
  drawLine(page, "Para iniciar, envíanos tus documentos por WhatsApp y te guiamos paso a paso.", 42, y - 13, regular, 7.5);

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=cotizacion-${quote.token.slice(-8)}.pdf`,
    },
  });
}
