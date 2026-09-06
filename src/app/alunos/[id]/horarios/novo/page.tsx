import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DIAS_SEMANA } from "@/lib/format";
import { createHorarioFixo } from "@/actions/horarios";

export default async function NovoHorarioFixoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Novo horário fixo — {aluno.nome}</h1>
      <form action={createHorarioFixo} className="card space-y-4 p-4">
        <input type="hidden" name="alunoId" value={id} />
        <div>
          <label className="label" htmlFor="diaSemana">
            Dia da semana
          </label>
          <select id="diaSemana" name="diaSemana" required className="input" defaultValue="1">
            {DIAS_SEMANA.map((dia, i) => (
              <option key={dia} value={i}>
                {dia}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="horario">
              Horário
            </label>
            <input id="horario" name="horario" type="time" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="quadra">
              Quadra
            </label>
            <input id="quadra" name="quadra" className="input" placeholder="1" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="valorCentavos">
            Valor da aula (R$)
          </label>
          <input
            id="valorCentavos"
            name="valorCentavos"
            className="input"
            placeholder={`Padrão: ${(aluno.valorAulaPadraoCentavos / 100).toFixed(2).replace(".", ",")}`}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Deixe em branco para usar o valor padrão do aluno.
          </p>
        </div>
        <button type="submit" className="btn-primary w-full">
          Salvar horário
        </button>
      </form>
    </div>
  );
}
