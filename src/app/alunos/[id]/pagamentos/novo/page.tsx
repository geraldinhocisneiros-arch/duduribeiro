import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { dateToInputValue, hojeUTC, FORMAS_PAGAMENTO, formatCentavos } from "@/lib/format";
import { createPagamento } from "@/actions/pagamentos";

export default async function NovoPagamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const aluno = await prisma.aluno.findUnique({
    where: { id },
    include: { pacotes: { where: { status: "ATIVO" }, orderBy: { dataInicio: "desc" } } },
  });
  if (!aluno) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Registrar pagamento — {aluno.nome}</h1>
      <form action={createPagamento} className="card space-y-4 p-4">
        <input type="hidden" name="alunoId" value={id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="valor">
              Valor (R$)
            </label>
            <input id="valor" name="valor" required className="input" placeholder="120,00" />
          </div>
          <div>
            <label className="label" htmlFor="data">
              Data
            </label>
            <input
              id="data"
              name="data"
              type="date"
              required
              defaultValue={dateToInputValue(hojeUTC())}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="formaPagamento">
            Forma de pagamento
          </label>
          <select id="formaPagamento" name="formaPagamento" className="input" defaultValue="PIX">
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        {aluno.pacotes.length > 0 && (
          <div>
            <label className="label" htmlFor="pacoteId">
              Referente ao pacote (opcional)
            </label>
            <select id="pacoteId" name="pacoteId" className="input" defaultValue="">
              <option value="">Nenhum / avulso</option>
              {aluno.pacotes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.quantidadeAulas} aulas · {formatCentavos(p.valorTotalCentavos)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="label" htmlFor="observacoes">
            Observações
          </label>
          <textarea id="observacoes" name="observacoes" rows={2} className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">
          Salvar pagamento
        </button>
      </form>
    </div>
  );
}
