"use server";

import { prisma } from "@/lib/prisma";
import { parseReaisToCentavos, toDateOnlyUTC } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPacote(formData: FormData) {
  const alunoId = String(formData.get("alunoId") ?? "");
  const quantidadeAulas = Number(formData.get("quantidadeAulas"));
  const valorTotalCentavos = parseReaisToCentavos(String(formData.get("valorTotal") ?? "0"));
  const dataInicioStr = String(formData.get("dataInicio") ?? "");

  if (!alunoId || !quantidadeAulas || quantidadeAulas <= 0) {
    throw new Error("Dados incompletos para o pacote");
  }

  await prisma.pacote.create({
    data: {
      alunoId,
      quantidadeAulas,
      valorTotalCentavos,
      dataInicio: dataInicioStr ? toDateOnlyUTC(dataInicioStr) : new Date(),
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    },
  });

  revalidatePath(`/alunos/${alunoId}`);
  redirect(`/alunos/${alunoId}`);
}

export async function encerrarPacote(id: string, alunoId: string) {
  await prisma.pacote.update({ where: { id }, data: { status: "ENCERRADO" } });
  revalidatePath(`/alunos/${alunoId}`);
}

export async function reativarPacote(id: string, alunoId: string) {
  await prisma.pacote.update({ where: { id }, data: { status: "ATIVO" } });
  revalidatePath(`/alunos/${alunoId}`);
}

export async function cancelarPacote(id: string, alunoId: string) {
  await prisma.pacote.update({ where: { id }, data: { status: "CANCELADO" } });
  revalidatePath(`/alunos/${alunoId}`);
}
