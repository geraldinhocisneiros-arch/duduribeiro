import AulaForm from "@/components/AulaForm";
import { getAlunosParaFormularioAula } from "@/lib/queries";
import { dateToInputValue, hojeUTC } from "@/lib/format";

export default async function NovaAulaPage({
  searchParams,
}: {
  searchParams: Promise<{
    data?: string;
    horario?: string;
    quadra?: string;
    horarioFixoId?: string;
    alunoId?: string;
    valor?: string;
  }>;
}) {
  const sp = await searchParams;
  const alunos = await getAlunosParaFormularioAula();

  const participantesIniciais = sp.alunoId
    ? [
        {
          key: "inicial-0",
          alunoId: sp.alunoId,
          valor: sp.valor ? (Number(sp.valor) / 100).toFixed(2).replace(".", ",") : "",
          pacoteId: "",
          consomeCredito: true,
          presenca: "COMPARECEU" as const,
        },
      ]
    : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Registrar aula</h1>
      <AulaForm
        alunos={alunos}
        dataInicial={sp.data ?? dateToInputValue(hojeUTC())}
        horarioInicial={sp.horario ?? ""}
        quadraInicial={sp.quadra}
        horarioFixoId={sp.horarioFixoId}
        participantesIniciais={participantesIniciais}
        redirectTo={sp.data ? `/?data=${sp.data}` : "/"}
      />
    </div>
  );
}
