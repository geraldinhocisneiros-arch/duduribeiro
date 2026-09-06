import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAlunosParaFormularioAula } from "@/lib/queries";
import { dateToInputValue } from "@/lib/format";
import AulaForm from "@/components/AulaForm";

export default async function EditarAulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aula = await prisma.aula.findUnique({
    where: { id },
    include: { participantes: true },
  });
  if (!aula) notFound();

  const alunos = await getAlunosParaFormularioAula();

  const participantesIniciais = aula.participantes.map((p, i) => ({
    key: `existente-${i}`,
    alunoId: p.alunoId,
    valor: (p.valorCentavos / 100).toFixed(2).replace(".", ","),
    pacoteId: p.pacoteId ?? "",
    consomeCredito: p.consomeCredito,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Editar aula</h1>
      <AulaForm
        alunos={alunos}
        aulaId={aula.id}
        dataInicial={dateToInputValue(aula.data)}
        horarioInicial={aula.horario}
        quadraInicial={aula.quadra ?? ""}
        observacoesInicial={aula.observacoes ?? ""}
        statusInicial={aula.status}
        horarioFixoId={aula.horarioFixoId ?? undefined}
        participantesIniciais={participantesIniciais}
        redirectTo={`/?data=${dateToInputValue(aula.data)}`}
      />
    </div>
  );
}
