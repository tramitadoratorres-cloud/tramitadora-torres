-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TramiteCatalogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "badge" TEXT NOT NULL DEFAULT '',
    "requisitos" TEXT NOT NULL DEFAULT '',
    "honorarioBase" INTEGER NOT NULL,
    "icono" TEXT NOT NULL DEFAULT 'documento',
    "destacado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_TramiteCatalogo" ("activo", "badge", "descripcion", "destacado", "honorarioBase", "id", "nombre", "orden", "requisitos") SELECT "activo", "badge", "descripcion", "destacado", "honorarioBase", "id", "nombre", "orden", "requisitos" FROM "TramiteCatalogo";
DROP TABLE "TramiteCatalogo";
ALTER TABLE "new_TramiteCatalogo" RENAME TO "TramiteCatalogo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
