"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import dados from "@/data/importacao-alunos-202609.json";

// Importação única da planilha de alunos/grade do Squash Tennis Center (set/2026).
// Idempotente: pode ser rodada mais de uma vez sem duplicar alunos/horários.
// "Leonardo Harrop" da planilha é a mesma pessoa que "leo harrop" já cadastrado
// no sistema — nesse caso completamos o cadastro existente em vez de criar outro.
export async function importarDadosIniciais() {
  let alunosCriados = 0;
  let alunosReaproveitados = 0;
  let horariosCriados = 0;
  let horariosJaExistiam = 0;

  const nomeParaId = new Map<string, string>();

  const leoHarrop = await prisma.aluno.findFirst({
    where: { nome: { equals: "leo harrop", mode: "insensitive" } },
  });

  for (const a of dados.alunos) {
    if (a.nome === "Leonardo Harrop" && leoHarrop) {
      nomeParaId.set(a.nome, leoHarrop.id);
      alunosReaproveitados++;
      continue;
    }

    const existente = await prisma.aluno.findFirst({
      where: { nome: { equals: a.nome, mode: "insensitive" } },
    });

    if (existente) {
      nomeParaId.set(a.nome, existente.id);
      alunosReaproveitados++;
      continue;
    }

    const criado = await prisma.aluno.create({
      data: {
        nome: a.nome,
        telefone: a.telefone,
        valorAulaPadraoCentavos: 0,
      },
    });
    nomeParaId.set(a.nome, criado.id);
    alunosCriados++;
  }

  for (const h of dados.horarios) {
    const alunoId = nomeParaId.get(h.aluno);
    if (!alunoId) continue;

    const jaExiste = await prisma.horarioFixo.findFirst({
      where: {
        alunoId,
        diaSemana: h.diaSemana,
        horario: h.horario,
        quadra: h.quadra,
      },
    });

    if (jaExiste) {
      horariosJaExistiam++;
      continue;
    }

    await prisma.horarioFixo.create({
      data: {
        alunoId,
        diaSemana: h.diaSemana,
        horario: h.horario,
        quadra: h.quadra,
      },
    });
    horariosCriados++;
  }

  redirect(
    `/admin/importar?done=1&alunosCriados=${alunosCriados}&alunosReaproveitados=${alunosReaproveitados}&horariosCriados=${horariosCriados}&horariosJaExistiam=${horariosJaExistiam}`
  );
}
