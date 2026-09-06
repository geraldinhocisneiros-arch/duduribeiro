import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSaldoAluno } from "@/lib/queries";
import { formatCentavos } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AlunosPage() {
  const alunos = await prisma.aluno.findMany({ orderBy: { nome: "asc" } });
  const saldos = await Promise.all(alunos.map((a) => getSaldoAluno(a.id)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Alunos</h1>
        <Link href="/alunos/novo" className="btn-primary">
          + Novo aluno
        </Link>
      </div>

      <div className="space-y-2">
        {alunos.map((aluno, i) => {
          const saldo = saldos[i];
          return (
            <Link
              key={aluno.id}
              href={`/alunos/${aluno.id}`}
              className="card flex items-center justify-between p-4"
            >
              <div>
                <p className={`font-medium ${!aluno.ativo ? "text-[var(--muted)] line-through" : ""}`}>
                  {aluno.nome}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {formatCentavos(aluno.valorAulaPadraoCentavos)} / aula
                </p>
              </div>
              {saldo.saldoCentavos > 0 && (
                <span className="badge bg-red-100 text-[var(--danger)]">
                  deve {formatCentavos(saldo.saldoCentavos)}
                </span>
              )}
              {saldo.saldoCentavos < 0 && (
                <span className="badge bg-green-100 text-[var(--primary-dark)]">
                  crédito {formatCentavos(-saldo.saldoCentavos)}
                </span>
              )}
              {saldo.saldoCentavos === 0 && (
                <span className="badge bg-gray-100 text-[var(--muted)]">em dia</span>
              )}
            </Link>
          );
        })}
        {alunos.length === 0 && (
          <p className="card p-4 text-sm text-[var(--muted)]">Nenhum aluno cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
