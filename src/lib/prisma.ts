import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usa o driver `pg` (node-postgres) em vez do engine de conexão padrão do
// Prisma: o engine padrão mantém prepared statements nomeados por conexão,
// o que colide com o pooler em modo transaction/session do Supabase em
// ambiente serverless (erro "prepared statement already exists"). O `pg`
// não nomeia os statements, então não sofre desse conflito.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
