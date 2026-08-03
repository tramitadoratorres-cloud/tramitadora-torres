import "server-only";
import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import crypto from "node:crypto";

const MAX_ARCHIVO_BYTES = 15 * 1024 * 1024; // 15 MB

// Los archivos viven junto a la base de datos: en local es <root>/uploads,
// en producción es el mismo volumen persistente montado en /data.
function resolveUploadsDir(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "");
  const dbDir = path.isAbsolute(raw)
    ? path.dirname(raw)
    : path.dirname(path.join(process.cwd(), raw));
  return path.join(dbDir, "uploads");
}

export function archivoMaxBytes() {
  return MAX_ARCHIVO_BYTES;
}

export async function guardarArchivo(casoId: string, file: File) {
  if (file.size > MAX_ARCHIVO_BYTES) {
    throw new Error("El archivo pesa más de 15 MB.");
  }

  const dir = path.join(resolveUploadsDir(), casoId);
  await mkdir(dir, { recursive: true });

  const nombreDisco = `${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const rutaCompleta = path.join(dir, nombreDisco);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(rutaCompleta, bytes);

  return {
    rutaArchivo: path.join(casoId, nombreDisco),
    nombre: file.name,
    mimeType: file.type || "application/octet-stream",
    tamano: file.size,
  };
}

export async function leerArchivo(rutaArchivo: string) {
  const rutaCompleta = path.join(resolveUploadsDir(), rutaArchivo);
  return readFile(rutaCompleta);
}

export async function borrarArchivo(rutaArchivo: string) {
  const rutaCompleta = path.join(resolveUploadsDir(), rutaArchivo);
  await unlink(rutaCompleta).catch(() => {});
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
}
