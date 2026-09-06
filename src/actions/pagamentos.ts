"use server";

import { prisma } from "@/lib/prisma";
import { parseReaisToCentavos, toDateOnlyUTC } from "@/lib/format";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FormaPagamento } from "@prisma/client";

export async function createPagamento(formData: FormData) {
  const alunoId = String(formData.get("alunoId") ?? "");
  const valorCentavos = parseReaisToCentavos(String(formData.get("valor") ?? "0"));
  const dataStr = String(formData.get("data") ?? "");
  const pacoteId = String(formData.get("pacoteId") ?? "").trim() || null;
  const formaPagamento = String(formData.get("formaPagamento") ?? "PIX") as FormaPagamento;

  if (!alunoId || valorCentavos <= 0) {
    throw new Error("Dados incompletos para o pagamento");
  }

  await prisma.pagamento.create({
    data: {
      alunoId,
      valorCentavos,
      data: dataStr ? toDateOnlyUTC(dataStr) : new Date(),
      pacoteId,
      formaPagamento,
      observacoes: String(formData.get("observacoes") ?? "").trim() || null,
    },
  });

  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/financeiro");
  redirect(`/alunos/${alunoId}`);
}

export async function excluirPagamento(id: string, alunoId: string) {
  await prisma.pagamento.delete({ where: { id } });
  revalidatePath(`/alunos/${alunoId}`);
  revalidatePath("/financeiro");
}
