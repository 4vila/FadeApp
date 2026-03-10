# Estetica — Plataforma de agendamento para barbearias e clínicas

Sistema de agendamento e gestão para barbearias e clínicas de estética: visitantes buscam barbearias e agendam; clientes gerenciam agendamentos; profissionais veem a agenda; barbearias administram profissionais, serviços e agendamentos.

## Tecnologias

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, react-hook-form, Zod
- **Backend:** Next.js API Routes
- **Banco:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js (credenciais, sessão JWT com role)

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx          # Layout global (SessionProvider, metadata)
│   ├── page.tsx            # Landing
│   ├── contato/            # Página de contato (WhatsApp)
│   ├── barbearias/         # Listagem e página pública da barbearia
│   │   └── [id]/agendar/   # Fluxo de agendamento (cliente logado)
│   ├── login/, cadastro/
│   ├── cliente/dashboard/  # Área do cliente (agendamentos, perfil)
│   ├── profissional/dashboard/ # Área do profissional (agenda)
│   ├── barbearia/dashboard/ # Painel da barbearia (admin)
│   └── api/                # API Routes (auth, barbearias, agendamentos, etc.)
├── components/             # UI (layout, forms, barbearia, ui shadcn)
├── lib/                    # prisma, auth, auth-barbearia, validations, utils
└── types/                  # next-auth.d.ts
prisma/
├── schema.prisma
├── seed.ts                 # Admin Hares + opcional barbearia de exemplo
└── migrations/
```

## Como rodar localmente

### 1. Dependências

```bash
npm install
```

### 2. Banco de dados (PostgreSQL)

Com Docker:

```bash
docker-compose up -d
```

Isso sobe o PostgreSQL na porta 5432 (usuário/senha/db: `estetica`).

### 3. Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env.local
```

Em `.env.local`:

- `DATABASE_URL="postgresql://estetica:estetica@localhost:5432/estetica"`
- `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`
- `NEXTAUTH_URL="http://localhost:3000"`

### 4. Migrações e seed

```bash
npx prisma migrate deploy
npx prisma db seed
```

O seed cria o usuário administrador **Hares** (email: `hares@estetica.local`, senha: `RaelM040124@`).

### 5. Usuário administrador

| Campo  | Valor                    |
|--------|--------------------------|
| Nome   | Hares                    |
| Email  | `hares@estetica.local`   |
| Senha  | `RaelM040124@`           |
| Role   | `admin`                  |

- **Criar ou atualizar:** `npm run db:seed`
- **Uso:** acesse [/login](/login), entre com as credenciais acima e use o link **Painel** na navbar para ir ao painel da barbearia ([/barbearia/dashboard](/barbearia/dashboard)). O admin tem acesso ao painel mesmo sem estar vinculado a uma barbearia (no MVP usa a primeira barbearia do banco).

### 6. Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel + Supabase)

- **Supabase:** Crie um projeto e use a connection string do PostgreSQL como `DATABASE_URL` na Vercel.
- **Vercel:** Conecte o repositório, defina as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` com a URL do app) e faça o deploy.
- **Migrações:** Rode `npx prisma migrate deploy` localmente com `DATABASE_URL` apontando para o Supabase (ou use o mesmo em CI) para criar as tabelas em produção.

Consulte `docs/SUPABASE_VERCEL.md` (se existir) para o passo a passo detalhado.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — gera Prisma Client e build Next.js
- `npm run start` — inicia em produção
- `npm run db:seed` — executa o seed (admin Hares)

## Documentação do código

O arquivo `docs/CODIGO.md` descreve a responsabilidade dos principais módulos (Prisma, auth, middleware, fluxo de agendamento, página protegida, API com Zod) e como eles se conectam.
