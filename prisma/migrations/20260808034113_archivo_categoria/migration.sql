-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Archivo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "citaId" TEXT,
    "categoria" TEXT NOT NULL DEFAULT 'GENERAL',
    "nombre" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "subidoPorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Archivo_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Archivo_citaId_fkey" FOREIGN KEY ("citaId") REFERENCES "Cita" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Archivo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Archivo" ("casoId", "citaId", "createdAt", "id", "mimeType", "nombre", "rutaArchivo", "subidoPorId", "tamano") SELECT "casoId", "citaId", "createdAt", "id", "mimeType", "nombre", "rutaArchivo", "subidoPorId", "tamano" FROM "Archivo";
DROP TABLE "Archivo";
ALTER TABLE "new_Archivo" RENAME TO "Archivo";
CREATE INDEX "Archivo_casoId_idx" ON "Archivo"("casoId");
CREATE INDEX "Archivo_citaId_idx" ON "Archivo"("citaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
