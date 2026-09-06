import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateToInputValue, hojeUTC } from "@/lib/format";
import { createPacote } from "@/actions/pacotes";

export default async function NovoPacotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = await prisma.aluno.findUnique({ where: { id } });
  if (!aluno) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Novo pacote — {aluno.nome}</h1>
      <form action={createPacote} className="card space-y-4 p-4">
        <input type="hidden" name="alunoId" value={id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="quantidadeAulas">
              Quantidade de aulas
            </label>
            <input
              id="quantidadeAulas"
              name="quantidadeAulas"
              type="number"
              min={1}
              required
              className="input"
              placeholder="4"
            />
          </div>
          <div>
            <label className="label" htmlFor="valorTotal">
              Valor total (R$)
            </label>
            <input id="valorTotal" name="valorTotal" required className="input" placeholder="480,00" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="dataInicio">
            Data de início
          </label>
          <input
            id="dataInicio"
            name="dataInicio"
            type="date"
            required
            defaultValue={dateToInputValue(hojeUTC())}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="observacoes">
            Observações
          </label>
          <textarea id="observacoes" name="observacoes" rows={2} className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">
          Salvar pacote
        </button>
      </form>
    </div>
  );
}
