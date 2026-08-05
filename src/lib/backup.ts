import "server-only";
import fs from "node:fs";
import path from "node:path";

const DIAS_A_CONSERVAR = 14;

// Misma lógica de resolución de ruta que src/lib/db.ts.
function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "");
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

/**
 * Copia la base de datos SQLite (y sus archivos -wal/-shm si existen, por si
 * está en modo WAL) a una carpeta "backups" junto a ella, una vez al día,
 * con rotación de DIAS_A_CONSERVAR días. Protege contra corrupción o borrado
 * accidental de datos — no contra la pérdida total del disco del servidor.
 */
export function respaldarBaseDeDatos() {
  const dbPath = resolveSqlitePath();
  if (!fs.existsSync(dbPath)) return;

  const backupsDir = path.join(path.dirname(dbPath), "backups");
  fs.mkdirSync(backupsDir, { recursive: true });

  const hoy = new Date().toISOString().slice(0, 10);
  const destino = path.join(backupsDir, `dev-${hoy}.db`);
  if (fs.existsSync(destino)) return; // ya hay respaldo de hoy

  for (const sufijo of ["", "-wal", "-shm"]) {
    const origen = `${dbPath}${sufijo}`;
    if (fs.existsSync(origen)) {
      fs.copyFileSync(origen, `${destino}${sufijo}`);
    }
  }

  const corte = Date.now() - DIAS_A_CONSERVAR * 24 * 60 * 60 * 1000;
  for (const archivo of fs.readdirSync(backupsDir)) {
    const ruta = path.join(backupsDir, archivo);
    if (fs.statSync(ruta).mtimeMs < corte) fs.unlinkSync(ruta);
  }
}
