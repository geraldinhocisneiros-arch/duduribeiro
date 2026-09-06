-- CreateTable
CREATE TABLE "Aluno" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "valorAulaPadraoCentavos" INTEGER NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HorarioFixo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,
    "quadra" TEXT,
    "valorCentavos" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HorarioFixo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pacote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "quantidadeAulas" INTEGER NOT NULL,
    "valorTotalCentavos" INTEGER NOT NULL,
    "dataInicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pacote_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "data" DATETIME NOT NULL,
    "horario" TEXT NOT NULL,
    "quadra" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DADA',
    "observacoes" TEXT,
    "horarioFixoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Aula_horarioFixoId_fkey" FOREIGN KEY ("horarioFixoId") REFERENCES "HorarioFixo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AulaParticipante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aulaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "pacoteId" TEXT,
    "consomeCredito" BOOLEAN NOT NULL DEFAULT true,
    "avulsa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AulaParticipante_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AulaParticipante_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AulaParticipante_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alunoId" TEXT NOT NULL,
    "pacoteId" TEXT,
    "valorCentavos" INTEGER NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formaPagamento" TEXT NOT NULL DEFAULT 'PIX',
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pagamento_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
