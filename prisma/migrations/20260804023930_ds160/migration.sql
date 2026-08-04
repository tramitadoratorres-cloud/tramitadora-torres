-- CreateTable
CREATE TABLE "FormularioDS160" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "datosJson" TEXT NOT NULL DEFAULT '{}',
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormularioDS160_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FormularioDS160_casoId_key" ON "FormularioDS160"("casoId");
