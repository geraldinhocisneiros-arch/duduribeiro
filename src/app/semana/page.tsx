import Link from "next/link";
import { getGradeSemanalComStatus } from "@/lib/queries";
import { DIAS_SEMANA, dateToInputValue, formatCentavos, formatDate, hojeUTC, segundaFeiraDaSemana, toDateOnlyUTC } from "@/lib/format";
import { checkinRapidoHorarioFixo, faltouHorarioFixo, cancelarSlotFixo, excluirAula } from "@/actions/aulas";

export const dynamic = "force-dynamic";

export default async function GradeSemanalPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>;
}) {
  const { semana } = await searchParams;
  const segundaFeira = semana ? toDateOnlyUTC(semana) : segundaFeiraDaSemana(hojeUTC());
  const segundaFeiraAtual = segundaFeiraDaSemana(hojeUTC());
  const isSemanaAtual = dateToInputValue(segundaFeira) === dateToInputValue(segundaFeiraAtual);

  const semanaAnterior = dateToInputValue(new Date(segundaFeira.getTime() - 7 * 24 * 60 * 60 * 1000));
  const semanaSeguinte = dateToInputValue(new Date(segundaFeira.getTime() + 7 * 24 * 60 * 60 * 1000));
  const domingo = new Date(segundaFeira.getTime() + 6 * 24 * 60 * 60 * 1000);

  const dias = await getGradeSemanalComStatus(segundaFeira);

  return (
    <div className="space-y-6">
      <div className="card p-1 flex gap-1">
        <Link href="/" className="btn-ghost flex-1 justify-center">
          Dia
        </Link>
        <Link href="/semana" className="btn-primary flex-1 justify-center">
          Semana
        </Link>
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/semana?semana=${semanaAnterior}`} className="btn-secondary" aria-label="Semana anterior">
            ←
          </Link>
          <div className="text-center">
            <p className="text-sm font-medium">
              {formatDate(segundaFeira)} a {formatDate(domingo)}
            </p>
            {!isSemanaAtual && (
              <Link href="/semana" className="text-xs text-[var(--primary)] underline">
                voltar para semana atual
              </Link>
            )}
          </div>
          <Link href={`/semana?semana=${semanaSeguinte}`} className="btn-secondary" aria-label="Próxima semana">
            →
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {dias.map(({ data, dataStr, diaSemana, slots }) => (
            <div key={dataStr} className="card w-64 shrink-0 p-3">
              <h2 className="mb-2 border-b border-[var(--border)] pb-2 font-semibold">
                {DIAS_SEMANA[diaSemana]}
                <span className="ml-1 font-normal text-[var(--muted)]">{formatDate(data)}</span>
              </h2>
              {slots.length === 0 && <p className="text-sm text-[var(--muted)]">—</p>}
              <div className="space-y-2">
                {slots.map(({ horarioFixo, aula }) => (
                  <div key={horarioFixo.id} className="rounded-lg bg-black/5 p-2 text-sm">
                    <p className="font-medium leading-tight">
                      {horarioFixo.horario}
                      {horarioFixo.quadra ? ` · Q${horarioFixo.quadra}` : ""}
                    </p>
                    <Link
                      href={`/alunos/${horarioFixo.alunoId}`}
                      className="leading-tight text-[var(--primary-dark)] underline"
                    >
                      {horarioFixo.aluno.nome}
                    </Link>
                    <p className="text-xs leading-tight text-[var(--muted)]">
                      {formatCentavos(horarioFixo.valorCentavos ?? horarioFixo.aluno.valorAulaPadraoCentavos)}
                    </p>

                    {!aula && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        <form action={checkinRapidoHorarioFixo.bind(null, horarioFixo.id, dataStr)}>
                          <button type="submit" className="btn-primary !px-2 !py-1 text-xs">
                            ✓ Compareceu
                          </button>
                        </form>
                        <form action={faltouHorarioFixo.bind(null, horarioFixo.id, dataStr)}>
                          <button type="submit" className="btn-secondary !px-2 !py-1 text-xs">
                            Faltou
                          </button>
                        </form>
                        <form action={cancelarSlotFixo.bind(null, horarioFixo.id, dataStr)}>
                          <button type="submit" className="btn-danger !px-2 !py-1 text-xs">
                            Cancelou
                          </button>
                        </form>
                      </div>
                    )}

                    {aula && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        {aula.status === "DADA" && (
                          <span className="badge bg-green-100 text-[var(--primary-dark)]">
                            Dada
                            {aula.participantes[0]?.presenca === "FALTOU" ? " (faltou)" : ""}
                          </span>
                        )}
                        {aula.status === "CANCELADA" && (
                          <span className="badge bg-red-100 text-[var(--danger)]">Cancelada</span>
                        )}
                        <form action={excluirAula.bind(null, aula.id)}>
                          <button type="submit" className="text-xs underline text-[var(--muted)]">
                            desfazer
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
