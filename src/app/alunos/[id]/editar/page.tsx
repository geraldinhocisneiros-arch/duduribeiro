import { notFound } from "next/navigation";
import AlunoForm from "@/components/AlunoForm";
import { prisma } from "@/lib/prisma";
import { updateAluno } from "@/actions/alunos";

export default async function EditarAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Editar aluno</h1>
      <AlunoForm aluno={aluno} action={updateAluno.bind(null, id)} />
    </div>
  );
}
