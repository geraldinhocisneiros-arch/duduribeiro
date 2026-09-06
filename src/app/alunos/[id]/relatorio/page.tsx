import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAulasRestantesPacote, getSaldoAluno } from "@/lib/queries";
import { formatCentavos, formatDate } from "@/lib/format";
import CopiarTexto from "@/components/CopiarTexto";

export const dynamic = "force-dynamic";

export default async function RelatorioAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) notFound();

  const [pacoteAtivo, saldo, participacoes] = await Promise.all([
    prisma.pacote.findFirst({ where: { alunoId: id, status: "ATIVO" }, orderBy: { dataInicio: "desc" } }),
    getSaldoAluno(id),
    prisma.aulaParticipante.findMany({
      where: { alunoId: id, aula: { status: "DADA" } },
      include: { aula: true },
      orderBy: { aula: { data: "desc" } },
      take: 15,
    }),
  ]);

  const aulasRestantes = pacoteAtivo
    ? await getAulasRestantesPacote(pacoteAtivo.id, pacoteAtivo.quantidadeAulas)
    : null;

  const linhas: string[] = [];
  linhas.push(`📋 Relatório de aulas — ${aluno.nome}`);
  linhas.push("");

  if (pacoteAtivo) {
    linhas.push(`Pacote atual: ${pacoteAtivo.quantidadeAulas} aulas contratadas`);
    linhas.push(`Aulas restantes: ${aulasRestantes}`);
    linhas.push("");
  }

  linhas.push("Últimas aulas dadas:");
  if (participacoes.length === 0) {
    linhas.push("(nenhuma aula registrada ainda)");
  }
  for (const p of participacoes) {
    linhas.push(`• ${formatDate(p.aula.data)} às ${p.aula.horario} — ${formatCentavos(p.valorCentavos)}`);
  }
  linhas.push("");

  linhas.push("Financeiro:");
  linhas.push(`Total de aulas dadas: ${formatCentavos(saldo.totalServicosCentavos)}`);
  linhas.push(`Total pago: ${formatCentavos(saldo.totalPagoCentavos)}`);
  if (saldo.saldoCentavos > 0) {
    linhas.push(`Situação: em aberto ${formatCentavos(saldo.saldoCentavos)}`);
  } else if (saldo.saldoCentavos < 0) {
    linhas.push(`Situação: crédito de ${formatCentavos(-saldo.saldoCentavos)}`);
  } else {
    linhas.push("Situação: em dia");
  }

  const texto = linhas.join("\n");

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Relatório — {aluno.nome}</h1>
      <p className="text-sm text-[var(--muted)]">
        Texto pronto para copiar e enviar por WhatsApp/e-mail ao aluno.
      </p>
      <CopiarTexto texto={texto} />
    </div>
  );
}
