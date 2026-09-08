"use client";

import { useId, useState } from "react";
import { salvarAula } from "@/actions/aulas";

type PacoteOpcao = {
  id: string;
  quantidadeAulas: number;
  aulasRestantes: number;
};

export type AlunoOpcao = {
  id: string;
  nome: string;
  valorAulaPadraoCentavos: number;
  pacotesAtivos: PacoteOpcao[];
};

type ParticipanteRow = {
  key: string;
  alunoId: string;
  valor: string;
  pacoteId: string;
  consomeCredito: boolean;
  presenca: "COMPARECEU" | "FALTOU";
};

function centavosParaTexto(centavos: number) {
  return (centavos / 100).toFixed(2).replace(".", ",");
}

export default function AulaForm({
  alunos,
  aulaId,
  dataInicial,
  horarioInicial,
  quadraInicial,
  observacoesInicial,
  statusInicial,
  horarioFixoId,
  participantesIniciais,
  redirectTo,
}: {
  alunos: AlunoOpcao[];
  aulaId?: string;
  dataInicial: string;
  horarioInicial: string;
  quadraInicial?: string;
  observacoesInicial?: string;
  statusInicial?: "AGENDADA" | "DADA" | "CANCELADA";
  horarioFixoId?: string;
  participantesIniciais?: ParticipanteRow[];
  redirectTo?: string;
}) {
  const uid = useId();
  const [status, setStatus] = useState(statusInicial ?? "DADA");
  const [rows, setRows] = useState<ParticipanteRow[]>(
    participantesIniciais && participantesIniciais.length > 0
      ? participantesIniciais
      : [{ key: `${uid}-0`, alunoId: "", valor: "", pacoteId: "", consomeCredito: true, presenca: "COMPARECEU" }]
  );

  function addRow() {
    setRows((r) => [
      ...r,
      {
        key: `${uid}-${r.length}-${Date.now()}`,
        alunoId: "",
        valor: "",
        pacoteId: "",
        consomeCredito: true,
        presenca: "COMPARECEU",
      },
    ]);
  }

  function removeRow(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  function updateRow(key: string, patch: Partial<ParticipanteRow>) {
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function onAlunoChange(key: string, alunoId: string) {
    const aluno = alunos.find((a) => a.id === alunoId);
    setRows((r) =>
      r.map((row) =>
        row.key === key
          ? {
              ...row,
              alunoId,
              pacoteId: "",
              valor: row.valor || (aluno ? centavosParaTexto(aluno.valorAulaPadraoCentavos) : row.valor),
            }
          : row
      )
    );
  }

  return (
    <form action={salvarAula} className="card space-y-4 p-4">
      {aulaId && <input type="hidden" name="aulaId" value={aulaId} />}
      {horarioFixoId && <input type="hidden" name="horarioFixoId" value={horarioFixoId} />}
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/"} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="data">
            Data
          </label>
          <input id="data" name="data" type="date" required defaultValue={dataInicial} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="horario">
            Horário
          </label>
          <input
            id="horario"
            name="horario"
            type="time"
            required
            defaultValue={horarioInicial}
            className="input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="quadra">
            Quadra
          </label>
          <input id="quadra" name="quadra" defaultValue={quadraInicial ?? ""} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="DADA">Dada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      {status !== "CANCELADA" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="label !mb-0">Participantes</label>
            <button type="button" onClick={addRow} className="btn-ghost text-xs">
              + dividir quadra / adicionar aluno
            </button>
          </div>

          {rows.map((row) => {
            const aluno = alunos.find((a) => a.id === row.alunoId);
            return (
              <div key={row.key} className="space-y-2 rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center gap-2">
                  <select
                    name="participanteAlunoId"
                    required
                    className="input"
                    value={row.alunoId}
                    onChange={(e) => onAlunoChange(row.key, e.target.value)}
                  >
                    <option value="">Selecione o aluno</option>
                    {alunos.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nome}
                      </option>
                    ))}
                  </select>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      className="btn-ghost text-xs"
                      aria-label="Remover participante"
                    >
                      remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">Valor (R$)</label>
                    <input
                      name="participanteValor"
                      required
                      className="input"
                      value={row.valor}
                      onChange={(e) => updateRow(row.key, { valor: e.target.value })}
                      placeholder="120,00"
                    />
                  </div>
                  <div>
                    <label className="label">Pacote</label>
                    <select
                      name="participantePacoteId"
                      className="input"
                      value={row.pacoteId}
                      onChange={(e) => updateRow(row.key, { pacoteId: e.target.value })}
                    >
                      <option value="">Avulsa (sem pacote)</option>
                      {aluno?.pacotesAtivos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.quantidadeAulas} aulas · restam {p.aulasRestantes}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Presença</label>
                  <select
                    name="participantePresenca"
                    className="input"
                    value={row.presenca}
                    onChange={(e) =>
                      updateRow(row.key, { presenca: e.target.value as "COMPARECEU" | "FALTOU" })
                    }
                  >
                    <option value="COMPARECEU">Compareceu</option>
                    <option value="FALTOU">Faltou (aula é cobrada normalmente)</option>
                  </select>
                </div>
                {row.pacoteId && (
                  <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <input
                      type="checkbox"
                      name="participanteConsomeCredito"
                      value={rows.indexOf(row)}
                      checked={row.consomeCredito}
                      onChange={(e) => updateRow(row.key, { consomeCredito: e.target.checked })}
                    />
                    Descontar 1 aula do pacote
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <label className="label" htmlFor="observacoes">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={2}
          defaultValue={observacoesInicial ?? ""}
          className="input"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Salvar aula
      </button>
    </form>
  );
}
