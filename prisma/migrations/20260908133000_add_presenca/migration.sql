-- CreateEnum
CREATE TYPE "Presenca" AS ENUM ('COMPARECEU', 'FALTOU');

-- AlterTable
ALTER TABLE "AulaParticipante" ADD COLUMN "presenca" "Presenca" NOT NULL DEFAULT 'COMPARECEU';
