import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAulasRestantesPacote, getSaldoAluno } from "@/lib/queries";
import { DIAS_SEMANA, formatCentavos, formatDate } from "@/lib/format";
import { toggleAtivoAluno } from "@/actions/alunos";
import { toggleAtivoHorarioFixo, excluirHorarioFixo } from "@/actions/horarios";
import { encerrarPacote, reativarPacote, cancelarPacote } from "@/actions/pacotes";
import { excluirPagamento } from "@/actions/pagamentos";

export const dynamic = "force-dynamic";

export default async function AlunoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: {
      horariosFixos: { orderBy: [{ diaSemana: "asc" }, { horario: "asc" }] },
      pacotes: { orderBy: { dataInicio: "desc" } },
      pagamentos: { orderBy: { data: "desc" } },
      participacoes: {
        include: { aula: true },
        orderBy: { aula: { data: "desc" } },
        take: 20,
      },
    },
  });
  if (!aluno) notFound();

  const saldo = await getSaldoAluno(id);
  const pacotesComRestantes = await Promise.all(
    aluno.pacotes.map(async (p) => ({
      ...p,
      aulasRestantes: await getAulasRestantesPacote(p.id, p.quantidadeAulas),
    }))
  );

  return (
    <div className="space-y-6">
      <div className="card space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">{aluno.nome}</h1>
            <p className="text-sm text-[var(--muted)]">
              {aluno.telefone ?? "sem telefone"} {aluno.email ? `· ${aluno.email}` : ""}
            </p>
            <p className="text-sm text-[var(--muted)]">
              Valor padrão: {formatCentavos(aluno.valorAulaPadraoCentavos)}
            </p>
            {aluno.observacoes && <p className="mt-1 text-sm">{aluno.observacoes}</p>}
          </div>
          {!aluno.ativo && <span className="badge bg-gray-200 text-[var(--muted)]">Inativo</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/alunos/${id}/editar`} className="btn-secondary">
            Editar dados
          </Link>
          <Link href={`/alunos/${id}/relatorio`} className="btn-secondary">
            Relatório
          </Link>
          <form action={toggleAtivoAluno.bind(null, id)}>
            <button type="submit" className="btn-ghost">
              {aluno.ativo ? "Desativar" : "Ativar"}
            </button>
          </form>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 font-semibold">Financeiro</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[var(--muted)]">Total de aulas dadas</p>
            <p className="font-medium">{formatCentavos(saldo.totalServicosCentavos)}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">Total pago</p>
            <p className="font-medium">{formatCentavos(saldo.totalPagoCentavos)}</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-black/5 p-3">
          {saldo.saldoCentavos > 0 && (
            <p className="font-medium text-[var(--danger)]">
              Deve {formatCentavos(saldo.saldoCentavos)}
            </p>
          )}
          {saldo.saldoCentavos < 0 && (
            <p className="font-medium text-[var(--primary-dark)]">
              Crédito de {formatCentavos(-saldo.saldoCentavos)}
            </p>
          )}
          {saldo.saldoCentavos === 0 && <p className="font-medium">Em dia</p>}
        </div>
        <Link href={`/alunos/${id}/pagamentos/novo`} className="btn-primary mt-3 w-full">
          + Registrar pagamento
        </Link>

        {aluno.pagamentos.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-[var(--border)] pt-3">
            {aluno.pagamentos.map((pg) => (
              <div key={pg.id} className="flex items-center justify-between text-sm">
                <span>
                  {formatDate(pg.data)} · {formatCentavos(pg.valorCentavos)} · {pg.formaPagamento}
                </span>
                <form action={excluirPagamento.bind(null, pg.id, id)}>
                  <button type="submit" className="text-xs text-[var(--muted)] underline">
                    excluir
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Horários fixos</h2>
          <Link href={`/alunos/${id}/horarios/novo`} className="btn-secondary">
            + Horário
          </Link>
        </div>
        {aluno.horariosFixos.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nenhum horário fixo cadastrado.</p>
        )}
        <div className="space-y-2">
          {aluno.horariosFixos.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm">
              <span className={!h.ativo ? "text-[var(--muted)] line-through" : ""}>
                {DIAS_SEMANA[h.diaSemana]} {h.horario}
                {h.quadra ? ` · Quadra ${h.quadra}` : ""} ·{" "}
                {formatCentavos(h.valorCentavos ?? aluno.valorAulaPadraoCentavos)}
              </span>
              <div className="flex gap-2">
                <form action={toggleAtivoHorarioFixo.bind(null, h.id, id)}>
                  <button type="submit" className="text-xs underline text-[var(--muted)]">
                    {h.ativo ? "pausar" : "reativar"}
                  </button>
                </form>
                <form action={excluirHorarioFixo.bind(null, h.id, id)}>
                  <button type="submit" className="text-xs underline text-[var(--danger)]">
                    excluir
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Pacotes de aulas</h2>
          <Link href={`/alunos/${id}/pacotes/novo`} className="btn-secondary">
            + Pacote
          </Link>
        </div>
        {pacotesComRestantes.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nenhum pacote cadastrado.</p>
        )}
        <div className="space-y-3">
          {pacotesComRestantes.map((p) => (
            <div key={p.id} className="rounded-lg border border-[var(--border)] p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {p.quantidadeAulas} aulas · {formatCentavos(p.valorTotalCentavos)}
                </span>
                <span
                  className={`badge ${
                    p.status === "ATIVO"
                      ? "bg-green-100 text-[var(--primary-dark)]"
                      : "bg-gray-100 text-[var(--muted)]"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <p className="mt-1 text-[var(--muted)]">
                Início {formatDate(p.dataInicio)} · Restam{" "}
                <span className={p.aulasRestantes <= 0 ? "text-[var(--danger)] font-medium" : ""}>
                  {p.aulasRestantes}
                </span>{" "}
                aula(s)
              </p>
              {p.observacoes && <p className="mt-1 text-[var(--muted)]">{p.observacoes}</p>}
              <div className="mt-2 flex gap-2">
                {p.status === "ATIVO" && (
                  <form action={encerrarPacote.bind(null, p.id, id)}>
                    <button type="submit" className="text-xs underline text-[var(--muted)]">
                      encerrar
                    </button>
                  </form>
                )}
                {p.status !== "ATIVO" && (
                  <form action={reativarPacote.bind(null, p.id, id)}>
                    <button type="submit" className="text-xs underline text-[var(--muted)]">
                      reativar
                    </button>
                  </form>
                )}
                {p.status !== "CANCELADO" && (
                  <form action={cancelarPacote.bind(null, p.id, id)}>
                    <button type="submit" className="text-xs underline text-[var(--danger)]">
                      cancelar
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 font-semibold">Últimas aulas</h2>
        {aluno.participacoes.length === 0 && (
          <p className="text-sm text-[var(--muted)]">Nenhuma aula registrada ainda.</p>
        )}
        <div className="space-y-1">
          {aluno.participacoes.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span>
                {formatDate(p.aula.data)} {p.aula.horario}
                {p.aula.status === "CANCELADA" ? " (cancelada)" : ""}
              </span>
              <span className="text-[var(--muted)]">{formatCentavos(p.valorCentavos)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
