# Como colocar o sistema no ar (passo a passo)

Vamos usar dois serviços gratuitos, cada um com um papel diferente:

- **Supabase** — o banco de dados Postgres (onde ficam salvos alunos, aulas,
  pagamentos). Você já tem conta, então reaproveitamos.
- **Vercel** — onde o site em si fica rodando, com um link público. É quem
  efetivamente executa o sistema; o Supabase sozinho não hospeda isso.

Os dois têm plano gratuito suficiente para o uso de um professor autônomo.
Leva uns 10 minutos.

## Passo 1 — Pegar as connection strings do banco no Supabase

O app usa duas conexões diferentes com o mesmo banco: uma "com pooler"
(mais rápida, usada o tempo todo pelo site) e uma "direta" (usada só na
hora de criar as tabelas). O Supabase disponibiliza as duas prontas.

1. Entre em **https://supabase.com/dashboard** e, se preferir isolar dos
   seus outros dados, crie um **novo projeto** (New Project) só para este
   sistema — nome sugerido: `duduribeiro`. Se preferir usar um projeto que
   já existe, pode pular direto pro próximo item (só não vai misturar com
   as tabelas de outro app).
2. Dentro do projeto, vá em **Project Settings → Database → Connection
   string**.
3. Você vai ver algumas opções de modo de conexão. Copie duas:
   - **Transaction pooler** (porta `6543`) — essa vai virar a variável
     `DATABASE_URL`. No final da URL, adicione `?pgbouncer=true`, ficando
     algo como:
     ```
     postgresql://postgres.xxxxxxxx:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **Session** ou **Direct connection** (porta `5432`) — essa vai virar a
     variável `DIRECT_URL`:
     ```
     postgresql://postgres.xxxxxxxx:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
     ```
4. Nas duas, troque `[SUA-SENHA]` pela senha do banco que você definiu ao
   criar o projeto (se não lembrar, dá pra resetar em **Database → Reset
   database password**). Guarde as duas URLs com cuidado — são a senha do
   seu banco.

## Passo 2 — Criar o projeto na Vercel a partir do GitHub

1. Acesse **https://vercel.com** e crie uma conta usando **login com
   GitHub** (assim ela já enxerga seus repositórios).
2. Clique em **Add New → Project**.
3. Selecione o repositório **`duduribeiro`** (o mesmo do GitHub onde está
   este código) e clique em **Import**.
4. Na tela de configuração do projeto:
   - **Branch**: escolha `claude/tennis-lesson-management-fufru0` (ou a
     branch que eu te indicar depois de cada atualização — se quiser, dá
     pra trocar depois pra `main`, te explico mais abaixo).
   - Em **Environment Variables**, adicione as duas:
     - Nome: `DATABASE_URL` → valor: a connection string do **Transaction
       pooler** (porta 6543 + `?pgbouncer=true`) do Passo 1
     - Nome: `DIRECT_URL` → valor: a connection string **Direct
       connection** (porta 5432) do Passo 1
5. Clique em **Deploy**. A Vercel vai instalar tudo, aplicar as tabelas no
   banco (isso já está configurado para acontecer automaticamente) e subir
   o site.
6. Quando terminar (leva 1–2 minutos), a Vercel te dá um link do tipo
   `https://duduribeiro-xxxx.vercel.app`. Esse é o link que você vai acessar
   do celular ou computador — pode salvar como atalho na tela inicial do
   celular pra abrir rápido, como um app.

## Passo 3 — Testar

Abra o link, cadastre um aluno de teste, confirme que aparece na tela
"Alunos". Se quiser, me avise que eu confirmo se está tudo funcionando do
meu lado também.

## Depois disso — atualizações futuras

Toda vez que eu fizer uma mudança no sistema e enviar (`push`) pra essa
branch, a Vercel detecta sozinha e atualiza o site automaticamente — você
não precisa fazer nada, só recarregar a página depois de alguns minutos.

## Se um dia quiser trocar de nome de branch pra "main"

O nome atual da branch (`claude/tennis-lesson-management-fufru0`) é só o
nome técnico gerado nessa sessão de trabalho. Não afeta o funcionamento,
mas se preferir algo mais limpo, é só pedir e eu ajusto (renomeio a branch
e aponto a Vercel pra ela).

## Dúvidas comuns

- **"Erro ao aplicar migração" / tela de erro no primeiro deploy** —
  geralmente é uma das duas URLs erradas, trocadas entre si, ou faltando o
  `?pgbouncer=true` na `DATABASE_URL`. Volte no Passo 1 e confira as duas.
- **Perdi a senha do banco** — no painel do Supabase dá pra gerar uma nova
  em **Database → Reset database password** (só lembre de atualizar as
  duas variáveis na Vercel depois).
- **Quero um domínio próprio** (ex. `sistema.duduribeiro.com.br`) — a Vercel
  permite isso de graça, é só ter o domínio registrado e configurar o DNS
  apontando pra ela; me chame quando quiser fazer isso que eu te guio.
