import { prisma } from "@/lib/prisma";
import { dateToInputValue } from "@/lib/format";

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

// Monta a grade semanal (segunda a domingo, a partir da data informada) com o status real
// de cada horário fixo naquela semana: pendente, dada (com presença) ou cancelada.
export async function getGradeSemanalComStatus(segundaFeira: Date) {
  const fimSemana = new Date(segundaFeira.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [horariosFixos, aulasDaSemana] = await Promise.all([
    prisma.horarioFixo.findMany({
      where: { ativo: true },
      include: { aluno: true },
      orderBy: [{ diaSemana: "asc" }, { horario: "asc" }],
    }),
    prisma.aula.findMany({
      where: { data: { gte: segundaFeira, lt: fimSemana }, horarioFixoId: { not: null } },
      include: { participantes: { include: { aluno: true, pacote: true } } },
    }),
  ]);

  const aulaPorChave = new Map(
    aulasDaSemana.map((a) => [`${a.horarioFixoId}_${dateToInputValue(a.data)}`, a])
  );

  return Array.from({ length: 7 }, (_, i) => {
    const data = new Date(segundaFeira.getTime() + i * 24 * 60 * 60 * 1000);
    const dataStr = dateToInputValue(data);
    const diaSemana = data.getUTCDay();
    const slots = horariosFixos
      .filter((h) => h.diaSemana === diaSemana)
      .map((horarioFixo) => ({
        horarioFixo,
        aula: aulaPorChave.get(`${horarioFixo.id}_${dataStr}`) ?? null,
      }));
    return { data, dataStr, diaSemana, slots };
  });
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
