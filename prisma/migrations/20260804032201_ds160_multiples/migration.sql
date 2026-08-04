/*
  Warnings:

  - The required column `token` was added to the `FormularioDS160` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FormularioDS160" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "datosJson" TEXT NOT NULL DEFAULT '{}',
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormularioDS160_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FormularioDS160" ("casoId", "createdAt", "datosJson", "enviado", "id", "updatedAt") SELECT "casoId", "createdAt", "datosJson", "enviado", "id", "updatedAt" FROM "FormularioDS160";
DROP TABLE "FormularioDS160";
ALTER TABLE "new_FormularioDS160" RENAME TO "FormularioDS160";
CREATE UNIQUE INDEX "FormularioDS160_token_key" ON "FormularioDS160"("token");
CREATE INDEX "FormularioDS160_casoId_idx" ON "FormularioDS160"("casoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
