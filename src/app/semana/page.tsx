import Link from "next/link";
import { getGradeSemanal } from "@/lib/queries";
import { DIAS_SEMANA_ABREV, formatCentavos } from "@/lib/format";

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

      {grade.length === 0 ? (
        <p className="card p-4 text-sm text-[var(--muted)]">Nenhum horário fixo cadastrado ainda.</p>
      ) : (
        <div className="card overflow-x-auto p-2">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 bg-[var(--card)] p-2 text-left text-xs font-medium text-[var(--muted)]">
                  Horário
                </th>
                {ORDEM_DIAS.map((dia) => (
                  <th key={dia} className="p-2 text-left text-xs font-medium text-[var(--muted)]">
                    {DIAS_SEMANA_ABREV[dia]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grade.map((linha) => (
                <tr key={linha.horario} className="border-t border-[var(--border)]">
                  <td className="sticky left-0 bg-[var(--card)] p-2 align-top font-medium">{linha.horario}</td>
                  {ORDEM_DIAS.map((dia) => (
                    <td key={dia} className="p-2 align-top">
                      {linha.porDia[dia].map((h) => (
                        <div key={h.id} className="mb-1 last:mb-0">
                          <p className="font-medium leading-tight">{h.aluno.nome}</p>
                          <p className="text-xs leading-tight text-[var(--muted)]">
                            {h.quadra ? `Quadra ${h.quadra} · ` : ""}
                            {formatCentavos(h.valorCentavos ?? h.aluno.valorAulaPadraoCentavos)}
                          </p>
                        </div>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
