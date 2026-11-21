import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import { formatFolio, formatMXN } from "@/lib/constants";
import { formatFechaHora } from "@/lib/tiempo";
import { generarMatrizQR } from "@/lib/qr";

const NAVY = rgb(0x0f / 255, 0x21 / 255, 0x38 / 255);
const GOLD = rgb(0xc8 / 255, 0x9a / 255, 0x3f / 255);
const INK = rgb(0x16 / 255, 0x22 / 255, 0x3a / 255);
const PAPER = rgb(0xf7 / 255, 0xf1 / 255, 0xe3 / 255);
const FAINT = rgb(0.45, 0.45, 0.48);

export interface ReceiptData { folio: number; fecha: Date; clienteNombre: string; clienteTelefono: string; tramiteNombre: string; monto: number; motivoAjuste?: string | null; agenteNombre?: string | null; enlaceSeguimiento: string; }

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const lines: string[] = []; let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && font.widthOfTextAtSize(next, size) > max) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line); return lines;
}

function text(page: PDFPage, value: string, x: number, y: number, max: number, font: PDFFont, size: number, color: ReturnType<typeof rgb>, leading: number) {
  const lines = wrap(value, font, size, max);
  lines.forEach((line, index) => page.drawText(line, { x, y: y - index * leading, size, font, color }));
  return lines.length * leading;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); const width = 612; const height = 792; const page = doc.addPage([width, height]); const margin = 48;
  const regular = await doc.embedFont(StandardFonts.Helvetica); const bold = await doc.embedFont(StandardFonts.HelveticaBold); const mono = await doc.embedFont(StandardFonts.Courier);
  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER }); page.drawRectangle({ x: 0, y: height - 104, width, height: 104, color: NAVY });
  const logo = await doc.embedPng(await readFile(path.join(process.cwd(), "public/assets/logo-mono.png"))); const scaled = logo.scale(48 / logo.width);
  page.drawImage(logo, { x: margin, y: height - 76, width: scaled.width, height: scaled.height });
  page.drawText("TRAMITADORA TORRES", { x: 116, y: height - 43, size: 18, font: bold, color: GOLD });
  page.drawText("COMPROBANTE DE HONORARIO DE GESTORIA", { x: 116, y: height - 64, size: 8.5, font: mono, color: rgb(0.92, 0.92, 0.87) });
  const folio = `FOLIO ${formatFolio(data.folio)}`; page.drawText(folio, { x: width - margin - mono.widthOfTextAtSize(folio, 10.5), y: height - 43, size: 10.5, font: mono, color: GOLD });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 160, borderColor: INK, borderWidth: 0.8, borderDashArray: [3, 3] });
  let y = height - 140;
  const field = (label: string, value: string) => { page.drawText(label.toUpperCase(), { x: margin, y, size: 7.5, font: mono, color: FAINT }); y -= 17; y -= text(page, value, margin, y, width - margin * 2, bold, 13.5, INK, 18) + 17; };
  field("Fecha", formatFechaHora(data.fecha, { dateStyle: "long" })); field("Cliente", data.clienteNombre); field("Telefono", data.clienteTelefono); field("Tramite", data.tramiteNombre); field("Honorario cobrado", formatMXN(data.monto)); if (data.motivoAjuste) field("Motivo del ajuste", data.motivoAjuste); if (data.agenteNombre) field("Atendio", data.agenteNombre);
  const footerTop = 182; page.drawLine({ start: { x: margin, y: footerTop }, end: { x: width - margin, y: footerTop }, thickness: 0.5, color: FAINT, dashArray: [2, 2] });
  const qrSize = 88; const qrY = footerTop - qrSize - 14; drawQr(page, generarMatrizQR(data.enlaceSeguimiento), margin, qrY, qrSize, INK);
  const x = margin + qrSize + 18; page.drawText("DA SEGUIMIENTO A TU TRAMITE EN LINEA", { x, y: qrY + qrSize - 8, size: 7.5, font: mono, color: FAINT }); text(page, data.enlaceSeguimiento, x, qrY + qrSize - 25, width - margin - x, mono, 7.2, NAVY, 10); page.drawText("Escanea el codigo QR o visita el enlace", { x, y: qrY + 4, size: 7.5, font: regular, color: FAINT });
  text(page, "Este comprobante corresponde unicamente al honorario cobrado por la gestoria. No incluye cuotas oficiales de gobierno, las cuales se cubren por separado.", margin, 54, width - margin * 2, regular, 7.8, FAINT, 10);
  return doc.save();
}

function drawQr(page: PDFPage, matrix: boolean[][], x: number, y: number, size: number, color: ReturnType<typeof rgb>) { const cell = size / matrix.length; for (let row = 0; row < matrix.length; row++) for (let col = 0; col < matrix.length; col++) if (matrix[row][col]) page.drawRectangle({ x: x + col * cell, y: y + (matrix.length - 1 - row) * cell, width: cell, height: cell, color }); }
