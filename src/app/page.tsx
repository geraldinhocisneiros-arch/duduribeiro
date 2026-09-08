import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAgendaDoDia } from "@/lib/queries";
import {
  DIAS_SEMANA,
  dateToInputValue,
  formatCentavos,
  formatDateLong,
  hojeUTC,
  toDateOnlyUTC,
} from "@/lib/format";
import { checkinRapidoHorarioFixo, faltouHorarioFixo, cancelarSlotFixo, excluirAula } from "@/actions/aulas";

export const dynamic = "force-dynamic";

function addDias(data: Date, dias: number) {
  return new Date(data.getTime() + dias * 24 * 60 * 60 * 1000);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>;
}) {
  const { data: dataParam } = await searchParams;
  const data = dataParam ? toDateOnlyUTC(dataParam) : hojeUTC();
  const dataStr = dateToInputValue(data);
  const isHoje = dataStr === dateToInputValue(hojeUTC());

  const [{ slotsFixos, aulasAvulsas }, totalAlunos] = await Promise.all([
    getAgendaDoDia(data),
    prisma.aluno.count({ where: { ativo: true } }),
  ]);

  const anterior = dateToInputValue(addDias(data, -1));
  const proximo = dateToInputValue(addDias(data, 1));

  return (
    <div className="space-y-6">
      <div className="card p-1 flex gap-1">
        <Link href="/" className="btn-primary flex-1 justify-center">
          Dia
        </Link>
        <Link href="/semana" className="btn-ghost flex-1 justify-center">
          Semana
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/?data=${anterior}`} className="btn-secondary" aria-label="Dia anterior">
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-medium capitalize">{formatDateLong(data)}</p>
            {!isHoje && (
              <Link href="/" className="text-xs text-[var(--primary)] underline">
                voltar para hoje
              </Link>
            )}
          </div>
          <Link href={`/?data=${proximo}`} className="btn-secondary" aria-label="Próximo dia">
            →
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Horários fixos do dia</h1>
        <Link
          href={`/aulas/nova?data=${dataStr}`}
          className="btn-primary"
        >
          + Aula avulsa
        </Link>
      </div>

      {slotsFixos.length === 0 && (
        <p className="card p-4 text-sm text-[var(--muted)]">
          Nenhum horário fixo cadastrado para {DIAS_SEMANA[data.getUTCDay()].toLowerCase()}.
        </p>
      )}

      <div className="space-y-3">
        {slotsFixos.map(({ horarioFixo, aula }) => (
          <div key={horarioFixo.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {horarioFixo.horario} — {horarioFixo.aluno.nome}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {horarioFixo.quadra ? `Quadra ${horarioFixo.quadra} · ` : ""}
                  {formatCentavos(horarioFixo.valorCentavos ?? horarioFixo.aluno.valorAulaPadraoCentavos)}
                </p>
              </div>
              {!aula && (
                <span className="badge bg-amber-100 text-[var(--warning)]">Pendente</span>
              )}
              {aula?.status === "DADA" && (
                <span className="badge bg-green-100 text-[var(--primary-dark)]">Dada</span>
              )}
              {aula?.status === "CANCELADA" && (
                <span className="badge bg-red-100 text-[var(--danger)]">Cancelada</span>
              )}
            </div>

            {aula && aula.status === "DADA" && (
              <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2 text-sm">
                {aula.participantes.map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span>
                      {p.aluno.nome}
                      {p.alunoId !== horarioFixo.alunoId && (
                        <span className="ml-1 text-xs text-[var(--warning)]">(substituição)</span>
                      )}
                      {p.presenca === "FALTOU" && (
                        <span className="ml-1 text-xs text-[var(--danger)]">(faltou)</span>
                      )}
                      {p.pacote ? "" : " · avulsa"}
                    </span>
                    <span className="text-[var(--muted)]">{formatCentavos(p.valorCentavos)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {!aula && (
                <>
                  <form action={checkinRapidoHorarioFixo.bind(null, horarioFixo.id, dataStr)}>
                    <button type="submit" className="btn-primary">
                      ✓ Compareceu
                    </button>
                  </form>
                  <form action={faltouHorarioFixo.bind(null, horarioFixo.id, dataStr)}>
                    <button type="submit" className="btn-secondary">
                      Faltou
                    </button>
                  </form>
                  <form action={cancelarSlotFixo.bind(null, horarioFixo.id, dataStr)}>
                    <button type="submit" className="btn-danger">
                      Cancelou (aviso prévio)
                    </button>
                  </form>
                  <Link
                    href={`/aulas/nova?data=${dataStr}&horario=${horarioFixo.horario}&quadra=${
                      horarioFixo.quadra ?? ""
                    }&horarioFixoId=${horarioFixo.id}&alunoId=${horarioFixo.alunoId}&valor=${
                      horarioFixo.valorCentavos ?? horarioFixo.aluno.valorAulaPadraoCentavos
                    }`}
                    className="btn-secondary"
                  >
                    Detalhar / substituir
                  </Link>
                </>
              )}
              {aula && (
                <>
                  <Link href={`/aulas/${aula.id}/editar`} className="btn-secondary">
                    Editar
                  </Link>
                  <form action={excluirAula.bind(null, aula.id)}>
                    <button type="submit" className="btn-ghost">
                      Excluir
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {aulasAvulsas.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Aulas avulsas / extras</h2>
          <div className="space-y-3">
            {aulasAvulsas.map((aula) => (
              <div key={aula.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {aula.horario}
                      {aula.quadra ? ` · Quadra ${aula.quadra}` : ""}
                    </p>
                    <div className="mt-1 space-y-0.5 text-sm">
                      {aula.participantes.map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <span>{p.aluno.nome}</span>
                          <span className="text-[var(--muted)]">{formatCentavos(p.valorCentavos)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {aula.status === "CANCELADA" && (
                    <span className="badge bg-red-100 text-[var(--danger)]">Cancelada</span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/aulas/${aula.id}/editar`} className="btn-secondary">
                    Editar
                  </Link>
                  <form action={excluirAula.bind(null, aula.id)}>
                    <button type="submit" className="btn-ghost">
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {totalAlunos === 0 && (
        <div className="card p-4 text-sm">
          Você ainda não tem alunos cadastrados.{" "}
          <Link href="/alunos/novo" className="text-[var(--primary)] underline">
            Cadastrar o primeiro aluno
          </Link>
          .
        </div>
      )}
    </div>
  );
}
