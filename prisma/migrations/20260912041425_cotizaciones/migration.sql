-- CreateTable
CREATE TABLE "Cotizacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "adultos" INTEGER NOT NULL DEFAULT 0,
    "menores" INTEGER NOT NULL DEFAULT 0,
    "configuracionJson" TEXT NOT NULL DEFAULT '{}',
    "honorariosMXN" INTEGER NOT NULL,
    "derechosMXN" INTEGER NOT NULL DEFAULT 0,
    "derechosUSD" INTEGER NOT NULL DEFAULT 0,
    "totalMXN" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "clienteId" TEXT,
    "convertidaEn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cotizacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cotizacion_token_key" ON "Cotizacion"("token");

-- CreateIndex
CREATE INDEX "Cotizacion_createdAt_idx" ON "Cotizacion"("createdAt");

-- CreateIndex
CREATE INDEX "Cotizacion_convertidaEn_idx" ON "Cotizacion"("convertidaEn");
