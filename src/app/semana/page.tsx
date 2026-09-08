import Link from "next/link";
import { getGradeSemanal } from "@/lib/queries";
import { DIAS_SEMANA, formatCentavos } from "@/lib/format";

export const dynamic = "force-dynamic";

// Semana começa na segunda-feira (1) e termina no domingo (0), pra ficar na ordem natural de trabalho
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];

export default async function GradeSemanalPage() {
  const grade = await getGradeSemanal();

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

      <div>
        <h1 className="text-lg font-semibold">Grade semanal</h1>
        <p className="text-sm text-[var(--muted)]">Todos os horários fixos ativos, por dia da semana.</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ minWidth: "max-content" }}>
          {ORDEM_DIAS.map((dia) => {
            const diaInfo = grade.find((g) => g.diaSemana === dia);
            const horarios = diaInfo?.horarios ?? [];
            return (
              <div key={dia} className="card w-56 shrink-0 p-3">
                <h2 className="mb-2 border-b border-[var(--border)] pb-2 font-semibold">
                  {DIAS_SEMANA[dia]}
                </h2>
                {horarios.length === 0 && (
                  <p className="text-sm text-[var(--muted)]">—</p>
                )}
                <div className="space-y-2">
                  {horarios.map((h) => (
                    <div key={h.id} className="rounded-lg bg-black/5 p-2 text-sm">
                      <p className="font-medium leading-tight">
                        {h.horario}
                        {h.quadra ? ` · Q${h.quadra}` : ""}
                      </p>
                      <p className="leading-tight">{h.aluno.nome}</p>
                      <p className="text-xs leading-tight text-[var(--muted)]">
                        {formatCentavos(h.valorCentavos ?? h.aluno.valorAulaPadraoCentavos)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
