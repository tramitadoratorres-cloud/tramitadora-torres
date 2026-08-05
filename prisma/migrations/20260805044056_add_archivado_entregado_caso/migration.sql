-- AlterTable
ALTER TABLE "Caso" ADD COLUMN "archivadoEn" DATETIME;
ALTER TABLE "Caso" ADD COLUMN "entregadoEn" DATETIME;

-- CreateIndex
CREATE INDEX "Caso_archivadoEn_idx" ON "Caso"("archivadoEn");
