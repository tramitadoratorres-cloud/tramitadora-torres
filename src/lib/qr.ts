import "server-only";
import { create } from "qrcode";

// Devuelve la matriz de módulos (true = módulo oscuro) de un QR, sin
// rasterizar a imagen — así se puede dibujar como vectores nítidos en el PDF.
export function generarMatrizQR(texto: string): boolean[][] {
  const qr = create(texto, { errorCorrectionLevel: "M" });
  const { size, data } = qr.modules;
  const matriz: boolean[][] = [];
  for (let row = 0; row < size; row++) {
    const fila: boolean[] = [];
    for (let col = 0; col < size; col++) {
      fila.push(Boolean(data[row * size + col]));
    }
    matriz.push(fila);
  }
  return matriz;
}
