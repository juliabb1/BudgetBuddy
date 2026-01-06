/*
  Warnings:

  - You are about to drop the column `documents` on the `Contract` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contract" DROP COLUMN "documents";

-- CreateTable
CREATE TABLE "Document" (
    "documentId" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("documentId")
);

-- CreateIndex
CREATE INDEX "Document_contractId_idx" ON "Document"("contractId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("contractId") ON DELETE CASCADE ON UPDATE CASCADE;
