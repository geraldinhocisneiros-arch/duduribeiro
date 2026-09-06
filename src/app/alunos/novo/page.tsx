import AlunoForm from "@/components/AlunoForm";
import { createAluno } from "@/actions/alunos";

export default function NovoAlunoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Novo aluno</h1>
      <AlunoForm action={createAluno} />
    </div>
  );
}
