import type { Aluno } from "@prisma/client";

export default function AlunoForm({
  aluno,
  action,
}: {
  aluno?: Aluno;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="card space-y-4 p-4">
      <div>
        <label className="label" htmlFor="nome">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={aluno?.nome}
          className="input"
          placeholder="Nome do aluno"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="telefone">
            Telefone / WhatsApp
          </label>
          <input
            id="telefone"
            name="telefone"
            defaultValue={aluno?.telefone ?? ""}
            className="input"
            placeholder="(11) 99999-9999"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={aluno?.email ?? ""}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="valorAulaPadrao">
          Valor padrão da aula (R$)
        </label>
        <input
          id="valorAulaPadrao"
          name="valorAulaPadrao"
          className="input"
          placeholder="120,00"
          defaultValue={
            aluno ? (aluno.valorAulaPadraoCentavos / 100).toFixed(2).replace(".", ",") : ""
          }
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          Usado como sugestão ao registrar aulas — pode ser ajustado por horário fixo ou por aula.
        </p>
      </div>
      <div>
        <label className="label" htmlFor="observacoes">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          defaultValue={aluno?.observacoes ?? ""}
          className="input"
        />
      </div>
      <button type="submit" className="btn-primary w-full">
        Salvar
      </button>
    </form>
  );
}
