-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TramiteCatalogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "honorarioBase" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Caso" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Caso_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Caso_tramiteCatalogoId_fkey" FOREIGN KEY ("tramiteCatalogoId") REFERENCES "TramiteCatalogo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActividadLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "userId" TEXT,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActividadLog_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ActividadLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recibo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "casoId" TEXT NOT NULL,
    "folio" INTEGER NOT NULL,
    "monto" INTEGER NOT NULL,
    "motivoAjuste" TEXT,
    "generadoPorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recibo_casoId_fkey" FOREIGN KEY ("casoId") REFERENCES "Caso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recibo_generadoPorId_fkey" FOREIGN KEY ("generadoPorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Caso_etapa_idx" ON "Caso"("etapa");

-- CreateIndex
CREATE INDEX "ActividadLog_casoId_idx" ON "ActividadLog"("casoId");

-- CreateIndex
CREATE UNIQUE INDEX "Recibo_folio_key" ON "Recibo"("folio");
