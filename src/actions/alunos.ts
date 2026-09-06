"use server";

import { prisma } from "@/lib/prisma";
import { parseReaisToCentavos } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAluno(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório");

  const aluno = await prisma.aluno.create({
    data: {
      nome,
      telefone: String(formData.get("telefone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      valorAulaPadraoCentavos: parseReaisToCentavos(String(formData.get("valorAulaPadrao") ?? "0")),
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    },
  });

  revalidatePath("/alunos");
  redirect(`/alunos/${aluno.id}`);
}

export async function updateAluno(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.aluno.update({
    where: { id },
    data: {
      nome,
      telefone: String(formData.get("telefone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      valorAulaPadraoCentavos: parseReaisToCentavos(String(formData.get("valorAulaPadrao") ?? "0")),
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    },
  });

  revalidatePath("/alunos");
  revalidatePath(`/alunos/${id}`);
  redirect(`/alunos/${id}`);
}

export async function toggleAtivoAluno(id: string) {
  const aluno = await prisma.aluno.findUniqueOrThrow({ where: { id } });
  await prisma.aluno.update({ where: { id }, data: { ativo: !aluno.ativo } });
  revalidatePath("/alunos");
  revalidatePath(`/alunos/${id}`);
}
