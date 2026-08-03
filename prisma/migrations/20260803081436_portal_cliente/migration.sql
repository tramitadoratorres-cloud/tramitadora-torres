/*
  Warnings:

  - The required column `tokenPublico` was added to the `Caso` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "lugar" TEXT NOT NULL DEFAULT '',
    "nota" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cita_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Archivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "subidoPorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Archivo_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Archivo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActividadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "userId" TEXT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "visibleCliente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActividadLog_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActividadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ActividadLog" ("casoId", "createdAt", "descripcion", "id", "tipo", "userId") SELECT "casoId", "createdAt", "descripcion", "id", "tipo", "userId" FROM "ActividadLog";
DROP TABLE "ActividadLog";
ALTER TABLE "new_ActividadLog" RENAME TO "ActividadLog";
CREATE INDEX "ActividadLog_casoId_idx" ON "ActividadLog"("casoId");
CREATE TABLE "new_Caso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "tramiteCatalogoId" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'NUEVO_CONTACTO',
    "precioCobrado" INTEGER,
    "motivoAjuste" TEXT,
    "documentosRecibidos" BOOLEAN NOT NULL DEFAULT false,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" DATETIME,
    "origen" TEXT NOT NULL DEFAULT 'MANUAL',
    "mensaje" TEXT,
    "pagoPreferenciaId" TEXT,
    "pagoId" TEXT,
    "pagoMetodo" TEXT,
    "tokenPublico" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Caso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caso_tramiteCatalogoId_fkey" FOREIGN KEY ("tramiteCatalogoId") REFERENCES "TramiteCatalogo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caso" ("clienteId", "createdAt", "documentosRecibidos", "etapa", "fechaPago", "id", "mensaje", "motivoAjuste", "origen", "pagado", "pagoId", "pagoMetodo", "pagoPreferenciaId", "precioCobrado", "tramiteCatalogoId", "updatedAt") SELECT "clienteId", "createdAt", "documentosRecibidos", "etapa", "fechaPago", "id", "mensaje", "motivoAjuste", "origen", "pagado", "pagoId", "pagoMetodo", "pagoPreferenciaId", "precioCobrado", "tramiteCatalogoId", "updatedAt" FROM "Caso";
DROP TABLE "Caso";
ALTER TABLE "new_Caso" RENAME TO "Caso";
CREATE UNIQUE INDEX "Caso_tokenPublico_key" ON "Caso"("tokenPublico");
CREATE INDEX "Caso_etapa_idx" ON "Caso"("etapa");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Cita_casoId_idx" ON "Cita"("casoId");

-- CreateIndex
CREATE INDEX "Archivo_casoId_idx" ON "Archivo"("casoId");
