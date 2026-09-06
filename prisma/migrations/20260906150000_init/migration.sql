-- CreateEnum
CREATE TYPE "StatusAula" AS ENUM ('AGENDADA', 'DADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPacote" AS ENUM ('ATIVO', 'ENCERRADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO', 'TRANSFERENCIA', 'OUTRO');

-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "valorAulaPadraoCentavos" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioFixo" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,
    "quadra" TEXT,
    "valorCentavos" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HorarioFixo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pacote" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "quantidadeAulas" INTEGER NOT NULL,
    "valorTotalCentavos" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusPacote" NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "horario" TEXT NOT NULL,
    "quadra" TEXT,
    "status" "StatusAula" NOT NULL DEFAULT 'DADA',
    "observacoes" TEXT,
    "horarioFixoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AulaParticipante" (
    "id" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "pacoteId" TEXT,
    "consomeCredito" BOOLEAN NOT NULL DEFAULT true,
    "avulsa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AulaParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "pacoteId" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" "FormaPagamento" NOT NULL DEFAULT 'PIX',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Aula_data_idx" ON "Aula"("data");

-- CreateIndex
CREATE INDEX "AulaParticipante_alunoId_idx" ON "AulaParticipante"("alunoId");

-- CreateIndex
CREATE INDEX "AulaParticipante_pacoteId_idx" ON "AulaParticipante"("pacoteId");

-- CreateIndex
CREATE UNIQUE INDEX "AulaParticipante_aulaId_alunoId_key" ON "AulaParticipante"("aulaId", "alunoId");

-- CreateIndex
CREATE INDEX "Pagamento_alunoId_idx" ON "Pagamento"("alunoId");

-- AddForeignKey
ALTER TABLE "HorarioFixo" ADD CONSTRAINT "HorarioFixo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pacote" ADD CONSTRAINT "Pacote_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aula" ADD CONSTRAINT "Aula_horarioFixoId_fkey" FOREIGN KEY ("horarioFixoId") REFERENCES "HorarioFixo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaParticipante" ADD CONSTRAINT "AulaParticipante_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaParticipante" ADD CONSTRAINT "AulaParticipante_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AulaParticipante" ADD CONSTRAINT "AulaParticipante_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

