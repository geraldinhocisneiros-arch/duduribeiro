import Link from "next/link";
import { getResumoFinanceiroMes, getSaldoTodosAlunos } from "@/lib/queries";
import { formatCentavos } from "@/lib/format";

export const dynamic = "force-dynamic";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default async function FinanceiroPage() {
  const agora = new Date();
  const ano = agora.getUTCFullYear();
  const mes = agora.getUTCMonth() + 1;

  const [resumo, saldos] = await Promise.all([
    getResumoFinanceiroMes(ano, mes),
    getSaldoTodosAlunos(),
  ]);

  const devedores = saldos.filter((s) => s.saldoCentavos > 0).sort((a, b) => b.saldoCentavos - a.saldoCentavos);
  const emCredito = saldos.filter((s) => s.saldoCentavos < 0).sort((a, b) => a.saldoCentavos - b.saldoCentavos);
  const totalAReceber = devedores.reduce((acc, s) => acc + s.saldoCentavos, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Financeiro</h1>

      <div className="card p-4">
        <h2 className="mb-2 font-semibold">
          {MESES[mes - 1]} de {ano}
        </h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--muted)]">Recebido no mês</p>
            <p className="text-lg font-medium text-[var(--primary-dark)]">
              {formatCentavos(resumo.recebidoCentavos)}
            </p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Valor das aulas dadas</p>
            <p className="text-lg font-medium">{formatCentavos(resumo.servicosPrestadosCentavos)}</p>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 font-semibold">
          A receber ({formatCentavos(totalAReceber)})
        </h2>
        {devedores.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Ninguém está devendo. 🎉</p>
        )}
        <div className="space-y-2">
          {devedores.map((s) => (
            <Link
              key={s.aluno.id}
              href={`/alunos/${s.aluno.id}`}
              className="flex items-center justify-between text-sm"
            >
              <span>{s.aluno.nome}</span>
              <span className="font-medium text-[var(--danger)]">
                {formatCentavos(s.saldoCentavos)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {emCredito.length > 0 && (
        <div className="card p-4">
          <h2 className="mb-2 font-semibold">Alunos com crédito (pagaram adiantado)</h2>
          <div className="space-y-2">
            {emCredito.map((s) => (
              <Link
                key={s.aluno.id}
                href={`/alunos/${s.aluno.id}`}
                className="flex items-center justify-between text-sm"
              >
                <span>{s.aluno.nome}</span>
                <span className="font-medium text-[var(--primary-dark)]">
                  {formatCentavos(-s.saldoCentavos)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
