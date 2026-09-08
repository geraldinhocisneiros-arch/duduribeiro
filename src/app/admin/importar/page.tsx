import Link from "next/link";
import { importarDadosIniciais } from "@/actions/importar";

export default async function ImportarPage({
  searchParams,
}: {
  searchParams: Promise<{
    done?: string;
    alunosCriados?: string;
    alunosReaproveitados?: string;
    horariosCriados?: string;
    horariosJaExistiam?: string;
  }>;
}) {
  const sp = await searchParams;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Importar planilha inicial</h1>
      <p className="text-sm text-[var(--muted)]">
        Importa os 34 alunos e os 43 horários fixos da planilha do Squash Tennis Center
        (set/2026). &ldquo;Leonardo Harrop&rdquo; será mesclado com o &ldquo;leo harrop&rdquo;
        já cadastrado. Pode clicar mais de uma vez sem risco — alunos e horários já existentes
        não são duplicados.
      </p>

      {sp.done && (
        <div className="card space-y-1 p-4 text-sm">
          <p className="font-medium text-[var(--primary-dark)]">Importação concluída!</p>
          <p>Alunos criados: {sp.alunosCriados}</p>
          <p>Alunos já existentes (reaproveitados): {sp.alunosReaproveitados}</p>
          <p>Horários criados: {sp.horariosCriados}</p>
          <p>Horários que já existiam: {sp.horariosJaExistiam}</p>
          <Link href="/alunos" className="btn-primary mt-2 inline-flex">
            Ver lista de alunos
          </Link>
        </div>
      )}

      <form action={importarDadosIniciais}>
        <button type="submit" className="btn-primary">
          Importar alunos da planilha
        </button>
      </form>
    </div>
  );
}
