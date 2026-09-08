import { prisma } from "@/lib/prisma";

// Aulas restantes de um pacote = quantidade contratada - aulas já dadas que consomem crédito desse pacote
export async function getAulasRestantesPacote(pacoteId: string, quantidadeAulas: number) {
  const usadas = await prisma.aulaParticipante.count({
    where: {
      pacoteId,
      consomeCredito: true,
      aula: { status: "DADA" },
    },
  });
  return quantidadeAulas - usadas;
}

export async function getPacotesComSaldo(alunoId?: string) {
  const pacotes = await prisma.pacote.findMany({
    where: alunoId ? { alunoId } : undefined,
    include: { aluno: true },
    orderBy: { dataInicio: "desc" },
  });

  return Promise.all(
    pacotes.map(async (pacote) => ({
      ...pacote,
      aulasRestantes: await getAulasRestantesPacote(pacote.id, pacote.quantidadeAulas),
    }))
  );
}

// Saldo financeiro do aluno: total do valor das aulas já dadas menos total pago.
// Positivo = aluno deve. Negativo = aluno tem crédito (pagou adiantado).
export async function getSaldoAluno(alunoId: string) {
  const [totalServicos, totalPago] = await Promise.all([
    prisma.aulaParticipante.aggregate({
      where: { alunoId, aula: { status: "DADA" } },
      _sum: { valorCentavos: true },
    }),
    prisma.pagamento.aggregate({
      where: { alunoId },
      _sum: { valorCentavos: true },
    }),
  ]);

  const totalServicosCentavos = totalServicos._sum.valorCentavos ?? 0;
  const totalPagoCentavos = totalPago._sum.valorCentavos ?? 0;

  return {
    totalServicosCentavos,
    totalPagoCentavos,
    saldoCentavos: totalServicosCentavos - totalPagoCentavos,
  };
}

export async function getSaldoTodosAlunos() {
  const alunos = await prisma.aluno.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });

  const saldos = await Promise.all(
    alunos.map(async (aluno) => ({
      aluno,
      ...(await getSaldoAluno(aluno.id)),
    }))
  );

  return saldos;
}

export async function getResumoFinanceiroMes(ano: number, mes: number) {
  const inicio = new Date(Date.UTC(ano, mes - 1, 1));
  const fim = new Date(Date.UTC(ano, mes, 1));

  const [recebido, servicosPrestados] = await Promise.all([
    prisma.pagamento.aggregate({
      where: { data: { gte: inicio, lt: fim } },
      _sum: { valorCentavos: true },
    }),
    prisma.aulaParticipante.aggregate({
      where: { aula: { status: "DADA", data: { gte: inicio, lt: fim } } },
      _sum: { valorCentavos: true },
    }),
  ]);

  return {
    recebidoCentavos: recebido._sum.valorCentavos ?? 0,
    servicosPrestadosCentavos: servicosPrestados._sum.valorCentavos ?? 0,
  };
}

// Monta a lista de alunos ativos com seus pacotes ativos (e aulas restantes), usada nos formulários de aula
export async function getAlunosParaFormularioAula() {
  const alunos = await prisma.aluno.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    include: { pacotes: { where: { status: "ATIVO" }, orderBy: { dataInicio: "asc" } } },
  });

  return Promise.all(
    alunos.map(async (aluno) => ({
      id: aluno.id,
      nome: aluno.nome,
      valorAulaPadraoCentavos: aluno.valorAulaPadraoCentavos,
      pacotesAtivos: await Promise.all(
        aluno.pacotes.map(async (p) => ({
          id: p.id,
          quantidadeAulas: p.quantidadeAulas,
          aulasRestantes: await getAulasRestantesPacote(p.id, p.quantidadeAulas),
        }))
      ),
    }))
  );
}

// Monta a grade semanal: todos os horários fixos ativos, agrupados por horário e dia da semana
export async function getGradeSemanal() {
  const horariosFixos = await prisma.horarioFixo.findMany({
    where: { ativo: true },
    include: { aluno: true },
    orderBy: [{ horario: "asc" }, { diaSemana: "asc" }],
  });

  const horariosUnicos = Array.from(new Set(horariosFixos.map((h) => h.horario))).sort();

  const grade = horariosUnicos.map((horario) => ({
    horario,
    porDia: Array.from({ length: 7 }, (_, diaSemana) =>
      horariosFixos.filter((h) => h.horario === horario && h.diaSemana === diaSemana)
    ),
  }));

  return grade;
}

// Monta a agenda de um dia: horários fixos ativos daquele dia da semana + aulas avulsas/extra já registradas no dia
export async function getAgendaDoDia(data: Date) {
  const diaSemana = data.getUTCDay();
  const inicioDia = data;
  const fimDia = new Date(data.getTime() + 24 * 60 * 60 * 1000);

  const [horariosFixos, aulasDoDia] = await Promise.all([
    prisma.horarioFixo.findMany({
      where: { diaSemana, ativo: true },
      include: { aluno: true },
      orderBy: { horario: "asc" },
    }),
    prisma.aula.findMany({
      where: { data: { gte: inicioDia, lt: fimDia } },
      include: {
        participantes: { include: { aluno: true, pacote: true } },
        horarioFixo: true,
      },
      orderBy: { horario: "asc" },
    }),
  ]);

  const aulaPorHorarioFixoId = new Map(
    aulasDoDia.filter((a) => a.horarioFixoId).map((a) => [a.horarioFixoId as string, a])
  );

  const slotsFixos = horariosFixos.map((horarioFixo) => ({
    horarioFixo,
    aula: aulaPorHorarioFixoId.get(horarioFixo.id) ?? null,
  }));

  const aulasAvulsas = aulasDoDia.filter((a) => !a.horarioFixoId);

  return { slotsFixos, aulasAvulsas };
}
