"use server";

import { prisma } from "@/lib/prisma";
import { toDateOnlyUTC } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusAula } from "@prisma/client";

type ParticipanteInput = {
  alunoId: string;
  valorCentavos: number;
  pacoteId: string | null;
  consomeCredito: boolean;
  avulsa: boolean;
};

function parseParticipantes(formData: FormData): ParticipanteInput[] {
  const alunoIds = formData.getAll("participanteAlunoId").map(String);
  const valores = formData.getAll("participanteValor").map(String);
  const pacoteIds = formData.getAll("participantePacoteId").map(String);
  const consomeCreditoFlags = formData.getAll("participanteConsomeCredito").map(String);

  const participantes: ParticipanteInput[] = [];
  for (let i = 0; i < alunoIds.length; i++) {
    if (!alunoIds[i]) continue;
    const pacoteId = pacoteIds[i]?.trim() || null;
    const valorStr = valores[i]?.trim() ?? "0";
    const normalized = valorStr.replace(/[Rr]\$/g, "").trim().replace(/\./g, "").replace(",", ".");
    const valorCentavos = Math.round((Number.parseFloat(normalized) || 0) * 100);
    participantes.push({
      alunoId: alunoIds[i],
      valorCentavos,
      pacoteId,
      consomeCredito: pacoteId ? consomeCreditoFlags.includes(String(i)) : false,
      avulsa: !pacoteId,
    });
  }
  return participantes;
}

export async function salvarAula(formData: FormData) {
  const aulaId = String(formData.get("aulaId") ?? "").trim() || null;
  const data = String(formData.get("data") ?? "");
  const horario = String(formData.get("horario") ?? "");
  const quadra = String(formData.get("quadra") ?? "").trim() || null;
  const observacoes = String(formData.get("observacoes") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "DADA") as StatusAula;
  const horarioFixoId = String(formData.get("horarioFixoId") ?? "").trim() || null;
  const redirectTo = String(formData.get("redirectTo") ?? "/").trim() || "/";

  if (!data || !horario) throw new Error("Data e horário são obrigatórios");

  const participantes = status === "CANCELADA" ? [] : parseParticipantes(formData);

  const aulaData = {
    data: toDateOnlyUTC(data),
    horario,
    quadra,
    observacoes,
    status,
    horarioFixoId,
  };

  await prisma.$transaction(async (tx) => {
    let id = aulaId;
    if (id) {
      await tx.aula.update({ where: { id }, data: aulaData });
      await tx.aulaParticipante.deleteMany({ where: { aulaId: id } });
    } else {
      const aula = await tx.aula.create({ data: aulaData });
      id = aula.id;
    }

    if (participantes.length > 0) {
      await tx.aulaParticipante.createMany({
        data: participantes.map((p) => ({
          aulaId: id as string,
          alunoId: p.alunoId,
          valorCentavos: p.valorCentavos,
          pacoteId: p.pacoteId,
          consomeCredito: p.consomeCredito,
          avulsa: p.avulsa,
        })),
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/aulas");
  for (const p of participantes) {
    revalidatePath(`/alunos/${p.alunoId}`);
  }
  redirect(redirectTo);
}

// Check-in rápido de um horário fixo: usa os valores padrão do aluno/horário e
// o pacote ativo dele automaticamente (se houver). Para casos especiais (substituição,
// divisão de quadra, valor diferente) use o formulário completo.
export async function checkinRapidoHorarioFixo(horarioFixoId: string, dataStr: string) {
  const horarioFixo = await prisma.horarioFixo.findUniqueOrThrow({
    where: { id: horarioFixoId },
    include: { aluno: true },
  });

  const pacoteAtivo = await prisma.pacote.findFirst({
    where: { alunoId: horarioFixo.alunoId, status: "ATIVO" },
    orderBy: { dataInicio: "asc" },
  });

  const valorCentavos = horarioFixo.valorCentavos ?? horarioFixo.aluno.valorAulaPadraoCentavos;

  await prisma.aula.create({
    data: {
      data: toDateOnlyUTC(dataStr),
      horario: horarioFixo.horario,
      quadra: horarioFixo.quadra,
      status: "DADA",
      horarioFixoId: horarioFixo.id,
      participantes: {
        create: {
          alunoId: horarioFixo.alunoId,
          valorCentavos,
          pacoteId: pacoteAtivo?.id ?? null,
          consomeCredito: Boolean(pacoteAtivo),
          avulsa: !pacoteAtivo,
        },
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/alunos/${horarioFixo.alunoId}`);
}

export async function cancelarSlotFixo(horarioFixoId: string, dataStr: string) {
  const horarioFixo = await prisma.horarioFixo.findUniqueOrThrow({ where: { id: horarioFixoId } });

  await prisma.aula.create({
    data: {
      data: toDateOnlyUTC(dataStr),
      horario: horarioFixo.horario,
      quadra: horarioFixo.quadra,
      status: "CANCELADA",
      horarioFixoId: horarioFixo.id,
      observacoes: "Aula cancelada",
    },
  });

  revalidatePath("/");
}

export async function excluirAula(id: string) {
  const aula = await prisma.aula.findUniqueOrThrow({
    where: { id },
    include: { participantes: true },
  });
  await prisma.aula.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/aulas");
  for (const p of aula.participantes) {
    revalidatePath(`/alunos/${p.alunoId}`);
  }
}
