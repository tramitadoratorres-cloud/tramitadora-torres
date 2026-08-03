import path from "node:path";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DATABASE_URL puede ser relativo (local: "file:./dev.db", resuelto contra el
// cwd del proceso) o absoluto (producción: "file:/data/dev.db", un volumen
// montado). Resolvemos ambos casos explícitamente en vez de dejar que
// better-sqlite3 interprete la ruta relativa a un cwd que puede variar.
function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const raw = url.replace(/^file:/, "");
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw);
}

function createClient() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${resolveSqlitePath()}` });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
