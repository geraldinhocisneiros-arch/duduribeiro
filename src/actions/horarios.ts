"use server";

import { prisma } from "@/lib/prisma";
import { parseReaisToCentavos } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createHorarioFixo(formData: FormData) {
  const alunoId = String(formData.get("alunoId") ?? "");
  const diaSemana = Number(formData.get("diaSemana"));
  const horario = String(formData.get("horario") ?? "");
  if (!alunoId || Number.isNaN(diaSemana) || !horario) {
    throw new Error("Dados incompletos para o horário fixo");
  }

  const valorInput = String(formData.get("valorCentavos") ?? "").trim();

  await prisma.horarioFixo.create({
    data: {
      alunoId,
      diaSemana,
      horario,
      quadra: String(formData.get("quadra") ?? "").trim() || null,
      valorCentavos: valorInput ? parseReaisToCentavos(valorInput) : null,
    },
  });

  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/");
  redirect(`/alunos/${alunoId}`);
}

export async function toggleAtivoHorarioFixo(id: string, alunoId: string) {
  const horario = await prisma.horarioFixo.findUniqueOrThrow({ where: { id } });
  await prisma.horarioFixo.update({ where: { id }, data: { ativo: !horario.ativo } });
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/");
}

export async function excluirHorarioFixo(id: string, alunoId: string) {
  await prisma.horarioFixo.delete({ where: { id } });
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/");
}
