import "server-only";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { formatMXN } from "@/lib/constants";

const NAVY = rgb(0x0f / 255, 0x21 / 255, 0x38 / 255);
const GOLD = rgb(0xc8 / 255, 0x9a / 255, 0x3f / 255);
const INK = rgb(0x16 / 255, 0x22 / 255, 0x3a / 255);
const PAPER = rgb(0xf7 / 255, 0xf1 / 255, 0xe3 / 255);
const INK_FAINT = rgb(0.45, 0.45, 0.48);

export interface ReceiptData {
  folio: number;
  fecha: Date;
  clienteNombre: string;
  clienteTelefono: string;
  tramiteNombre: string;
  monto: number;
  motivoAjuste?: string | null;
  agenteNombre?: string | null;
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const width = 460;
  const height = 620;
  const page = doc.addPage([width, height]);

  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);

  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });

  const headerHeight = 92;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width,
    height: headerHeight,
    color: NAVY,
  });

  const logoBytes = await readFile(
    path.join(process.cwd(), "public/assets/logo.png")
  );
  const logoImage = await doc.embedPng(logoBytes);
  const logoBadgeRadius = 22;
  const logoBadgeCenter = { x: 40, y: height - headerHeight / 2 };
  page.drawEllipse({
    x: logoBadgeCenter.x,
    y: logoBadgeCenter.y,
    xScale: logoBadgeRadius,
    yScale: logoBadgeRadius,
    color: PAPER,
  });
  const logoSize = logoBadgeRadius * 1.6;
  const logoScaled = logoImage.scale(logoSize / logoImage.width);
  page.drawImage(logoImage, {
    x: logoBadgeCenter.x - logoScaled.width / 2,
    y: logoBadgeCenter.y - logoScaled.height / 2,
    width: logoScaled.width,
    height: logoScaled.height,
  });

  const textX = logoBadgeCenter.x + logoBadgeRadius + 14;
  page.drawText("TRAMITADORA TORRES", {
    x: textX,
    y: height - 42,
    size: 17,
    font: helveticaBold,
    color: GOLD,
  });
  page.drawText("COMPROBANTE DE HONORARIO DE GESTORIA", {
    x: textX,
    y: height - 62,
    size: 8.5,
    font: courier,
    color: rgb(0.92, 0.92, 0.87),
  });
  const folioText = `FOLIO #${String(data.folio).padStart(5, "0")}`;
  const folioSize = 11;
  const folioWidth = courier.widthOfTextAtSize(folioText, folioSize);
  page.drawText(folioText, {
    x: width - 28 - folioWidth,
    y: height - 42,
    size: folioSize,
    font: courier,
    color: GOLD,
  });

  // dashed border, evocando el ticket del sitio
  drawDashedRect(page, 18, 18, width - 36, height - headerHeight - 36, INK);

  let cursorY = height - headerHeight - 46;
  const leftX = 40;

  function field(label: string, value: string) {
    page.drawText(label.toUpperCase(), {
      x: leftX,
      y: cursorY,
      size: 7.5,
      font: courier,
      color: INK_FAINT,
    });
    cursorY -= 16;
    page.drawText(value, {
      x: leftX,
      y: cursorY,
      size: 13,
      font: helveticaBold,
      color: INK,
    });
    cursorY -= 30;
  }

  field(
    "Fecha",
    new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(data.fecha)
  );
  field("Cliente", data.clienteNombre);
  field("Telefono", data.clienteTelefono);
  field("Tramite", data.tramiteNombre);
  field("Honorario cobrado", formatMXN(data.monto));

  if (data.motivoAjuste) {
    field("Motivo del ajuste", data.motivoAjuste);
  }

  if (data.agenteNombre) {
    field("Atendio", data.agenteNombre);
  }

  // barcode decorativo
  const barcodeY = 110;
  const barcodeHeight = 34;
  let barX = leftX;
  let seed = data.folio * 7 + 13;
  while (barX < width - leftX) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const barWidth = 2.5 + (seed % 4);
    if (seed % 5 !== 0) {
      page.drawRectangle({
        x: barX,
        y: barcodeY,
        width: barWidth,
        height: barcodeHeight,
        color: INK,
      });
    }
    barX += barWidth + 1.5;
  }

  page.drawLine({
    start: { x: leftX, y: 90 },
    end: { x: width - leftX, y: 90 },
    thickness: 0.5,
    color: INK_FAINT,
    dashArray: [2, 2],
  });

  const disclaimer =
    "Este comprobante corresponde unicamente al honorario cobrado por la gestoria. No incluye cuotas oficiales de gobierno (SRE, Embajada de Estados Unidos o CBP), las cuales se cubren por separado. Tramitadora Torres no forma parte de dichas dependencias.";
  drawWrappedText(page, disclaimer, leftX, 74, width - leftX * 2, 8, helvetica, INK_FAINT, 10);

  return doc.save();
}

function drawDashedRect(
  page: import("pdf-lib").PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: ReturnType<typeof rgb>
) {
  const dash = { dashArray: [3, 3], thickness: 1, color };
  page.drawLine({ start: { x, y }, end: { x: x + w, y }, ...dash });
  page.drawLine({ start: { x, y: y + h }, end: { x: x + w, y: y + h }, ...dash });
  page.drawLine({ start: { x, y }, end: { x, y: y + h }, ...dash });
  page.drawLine({ start: { x: x + w, y }, end: { x: x + w, y: y + h }, ...dash });
}

function drawWrappedText(
  page: import("pdf-lib").PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: import("pdf-lib").PDFFont,
  color: ReturnType<typeof rgb>,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && line) {
      page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
      line = word;
      cursorY -= lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x, y: cursorY, size: fontSize, font, color });
  }
}
