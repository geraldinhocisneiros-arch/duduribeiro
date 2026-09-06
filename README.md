# Sistema Dudu Ribeiro — Gestão de Aulas de Tênis

Aplicação web para o Dudu controlar alunos, horários fixos, aulas dadas,
pacotes de aulas e financeiro (quem pagou, quem deve).

## O que o sistema resolve

- **Alunos**: cadastro com valor de aula padrão (cada aluno pode ter um valor
  diferente, mesmo aula fixa "1x", "2x" ou "3x" por semana em horário definido).
- **Horários fixos**: agenda semanal recorrente por aluno (dia da semana,
  horário, quadra, valor — se não informado usa o valor padrão do aluno).
- **Agenda do dia** (`/`): mostra os horários fixos do dia e permite dar
  "check" com um clique quando a aula acontece normalmente. Quando o aluno
  fixo falta e Dudu encaixa outra pessoa naquele horário, o botão
  "Detalhar / substituir" abre o horário para registrar quem participou de
  fato naquele dia — sem alterar o horário fixo original. Também é possível
  cancelar o horário do dia sem cobrar ninguém.
- **Aulas avulsas**: qualquer aula fora dos horários fixos (encaixe,
  reposição, aula extra) pode ser lançada em "+ Aula avulsa".
- **Quadra dividida / aula em grupo**: ao registrar uma aula é possível
  adicionar vários alunos na mesma aula, cada um com seu próprio valor —
  cobre o caso de dividir a quadra entre dois alunos ou dar aula para várias
  crianças ao mesmo tempo, cada mãe pagando seu valor.
- **Pacotes de aulas**: cada aluno pode ter um pacote (ex.: 8 aulas
  contratadas). A cada aula "dada" vinculada ao pacote, o sistema desconta
  1 crédito automaticamente e mostra quantas aulas restam.
- **Financeiro**: cada pagamento recebido é registrado por aluno. O sistema
  calcula o saldo (valor de todas as aulas dadas − valor pago), mostrando
  quem está devendo e quem pagou adiantado. A tela `/financeiro` resume o
  mês (recebido x valor das aulas dadas) e lista os devedores.
- **Relatório por aluno** (`/alunos/[id]/relatorio`): texto pronto para
  copiar e enviar por WhatsApp, com as aulas dadas, quantas aulas restam no
  pacote atual e a situação financeira.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Prisma](https://www.prisma.io) + PostgreSQL
- Tailwind CSS

## Rodando localmente

Precisa de um Postgres acessível (local, Docker, ou já o banco gerenciado de
produção — ver seção de Deploy abaixo).

```bash
npm install
cp .env.example .env   # edite DATABASE_URL com a connection string do seu Postgres
npx prisma migrate deploy
npm run dev
```

Acesse http://localhost:3000.

## Estrutura

- `prisma/schema.prisma` — modelo de dados (Aluno, HorarioFixo, Pacote, Aula,
  AulaParticipante, Pagamento)
- `src/actions/` — server actions (criação/edição de cada entidade)
- `src/lib/queries.ts` — cálculos (créditos restantes do pacote, saldo
  financeiro, agenda do dia)
- `src/app/` — páginas (agenda, alunos, aulas, financeiro, relatório)

## Deploy

Passo a passo completo (Vercel + Neon) no arquivo [`DEPLOY.md`](./DEPLOY.md).
