import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// prisma.config.ts resuelve DATABASE_URL relativo al cwd del proceso (no al
// directorio de schema.prisma), así que el archivo vive en la raíz del
// proyecto: <root>/dev.db. Usamos una ruta absoluta para no depender del cwd
// exacto desde el que se invoque el proceso de Next.js.
function createClient() {
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
