/*
  Warnings:

  - Added the required column `expedienteId` to the `Caso` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Expediente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expediente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Un Expediente por Caso ya existente (mismo id que su Caso), para no
-- agrupar de más casos históricos que no tienen relación entre sí. Agrupar
-- varios casos en un mismo expediente es algo que a partir de aquí se hace
-- explícitamente desde el CRM.
INSERT INTO "Expediente" ("id", "clienteId", "createdAt")
SELECT "id", "clienteId", "createdAt" FROM "Caso";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "paraQuien" TEXT,
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
    CONSTRAINT "Caso_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caso_tramiteCatalogoId_fkey" FOREIGN KEY ("tramiteCatalogoId") REFERENCES "TramiteCatalogo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caso" ("clienteId", "expedienteId", "createdAt", "documentosRecibidos", "etapa", "fechaPago", "id", "mensaje", "motivoAjuste", "origen", "pagado", "pagoId", "pagoMetodo", "pagoPreferenciaId", "precioCobrado", "tokenPublico", "tramiteCatalogoId", "updatedAt") SELECT "clienteId", "id", "createdAt", "documentosRecibidos", "etapa", "fechaPago", "id", "mensaje", "motivoAjuste", "origen", "pagado", "pagoId", "pagoMetodo", "pagoPreferenciaId", "precioCobrado", "tokenPublico", "tramiteCatalogoId", "updatedAt" FROM "Caso";
DROP TABLE "Caso";
ALTER TABLE "new_Caso" RENAME TO "Caso";
CREATE UNIQUE INDEX "Caso_tokenPublico_key" ON "Caso"("tokenPublico");
CREATE INDEX "Caso_etapa_idx" ON "Caso"("etapa");
CREATE INDEX "Caso_expedienteId_idx" ON "Caso"("expedienteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
