# Documentação do código — Plataforma Estetica

Este documento descreve, por módulo, a **responsabilidade**, o **que** cada parte faz e **como** se conecta ao resto do sistema.

---

## 1. Prisma (banco de dados)

**Arquivo:** `prisma/schema.prisma`

**Por quê:** Define os modelos de dados e a estrutura do banco PostgreSQL.

**O quê:**
- **User:** usuários do sistema (cliente, profissional, barbearia, admin). Campos: nome, email, senha (hash), role, barbeariaId (para profissional/dono).
- **Barbearia:** estabelecimento. Nome, endereço, cidade, telefone, logo, fotos, horário de funcionamento (JSON).
- **Profissional:** vínculo User–Barbearia. Especialidades, foto, dias e horário de trabalho.
- **Servico:** serviço oferecido pela barbearia (nome, descrição, duração, preço). Relação N:N com Profissional (ProfissionalServico).
- **Agenda:** slot ou bloqueio na agenda do profissional (data, hora início/fim, disponível, opcionalmente ligado a um Agendamento).
- **Agendamento:** reserva feita pelo cliente (cliente, profissional, serviço, dataHora, status: confirmado/cancelado/realizado).
- **Produto, Promocao, RegraCancelamento:** conforme o plano.

**Como:** O Prisma Client é gerado com `prisma generate` e usado em `src/lib/prisma.ts` (singleton) em todas as APIs e Server Components.

---

## 2. Autenticação (NextAuth)

**Arquivos:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts`

**Por quê:** Login por email/senha e controle de sessão com role (cliente, profissional, barbearia, admin).

**O quê:**
- **auth.ts:** Configuração do NextAuth com provider Credentials. No `authorize`, busca o User por email, compara senha com bcrypt e retorna `id`, `email`, `name`, `role`, `barbeariaId`. Callbacks `jwt` e `session` repassam `role` e `barbeariaId` para o token e para a sessão.
- **route.ts:** Exporta GET/POST para o handler do NextAuth (login, logout, session).
- **next-auth.d.ts:** Declaração de tipos para estender Session e JWT com `role` e `barbeariaId`.

**Como:** O middleware usa `getToken` para proteger rotas por role. As APIs usam `auth()` para obter a sessão e validar permissões.

---

## 3. Middleware

**Arquivo:** `src/middleware.ts`

**Por quê:** Impedir acesso às áreas restritas sem login ou com role incorreta.

**O quê:** Para `/cliente/*`, `/profissional/*` e `/barbearia/*`, lê o JWT com `getToken`, verifica se existe sessão e se o `role` corresponde à rota. Caso contrário, redireciona para `/login` com `callbackUrl` ou para `?error=Unauthorized`.

**Como:** Next.js executa o middleware antes de renderizar a página. As rotas protegidas só são acessíveis com o role correto.

---

## 4. Helper do painel barbearia

**Arquivo:** `src/lib/auth-barbearia.ts`

**Por quê:** Centralizar a resolução do “qual barbearia este usuário está gerenciando” nas APIs do painel.

**O quê:**
- **getBarbeariaIdForSession:** Se o usuário tem role `barbearia`, retorna `session.user.barbeariaId`. Se é `admin`, retorna o id da primeira barbearia do banco (para MVP).
- **requireBarbeariaAccess:** Garante que há sessão, role barbearia ou admin, e que existe uma barbearia; retorna `{ session, barbeariaId }` ou `{ error, status }`.

**Como:** Todas as rotas em `/api/barbearia/*` usam `requireBarbeariaAccess()` no início para garantir permissão e obter o `barbeariaId` das queries.

---

## 5. Fluxo de agendamento

**APIs:** `src/app/api/agendamentos/slots/route.ts`, `src/app/api/agendamentos/route.ts`

**Por quê:** Fornecer horários disponíveis e criar o agendamento após a escolha do cliente.

**O quê:**
- **slots/route.ts (GET):** Recebe `barbeariaId`, `profissionalId`, `servicoId`, `data` (YYYY-MM-DD). Busca horário de funcionamento da barbearia (ou padrão 9h–18h), duração do serviço, agendamentos confirmados e bloqueios (Agenda) do profissional na data. Gera slots (ex.: a cada 30 min) e remove os que colidem com ocupados/bloqueios. Retorna `{ slots: ["09:00", "09:30", ...] }`.
- **agendamentos/route.ts (POST):** Recebe `barbeariaId`, `profissionalId`, `servicoId`, `dataHora` (ISO). Verifica sessão (cliente), valida serviço da barbearia e conflitos no horário (outros agendamentos confirmados no mesmo profissional). Cria o Agendamento com status `confirmado`.

**Como:** A página `/barbearias/[id]/agendar` (FluxoAgendamento) chama primeiro a API de slots para exibir horários e, ao confirmar, envia POST para criar o agendamento.

---

## 6. Exemplo de página protegida

**Arquivo:** `src/app/cliente/dashboard/page.tsx`

**Por quê:** Mostrar ao cliente apenas seus agendamentos e permitir cancelar.

**O quê:** Client Component que, ao montar, chama `GET /api/agendamentos?cliente=true`. A API usa `auth()` e filtra por `clienteId === session.user.id`. A página separa “próximos” e “histórico” e oferece botão “Cancelar”, que chama `PATCH /api/agendamentos/[id]` com `action: "cancelar"`. A API de PATCH valida a regra de antecedência (RegraCancelamento da barbearia) antes de atualizar o status para `cancelado`.

**Como:** O layout de `/cliente/dashboard` usa `auth()` no servidor e redireciona para login se não houver sessão ou se o role não for `cliente`. Assim, apenas clientes autenticados acessam a página e as APIs de agendamento do cliente.

---

## 7. Estrutura geral

- **Rotas públicas:** `/`, `/barbearias`, `/barbearias/[id]`, `/contato`, `/login`, `/cadastro`. Não exigem sessão.
- **Rotas protegidas por role:** `/cliente/*`, `/profissional/*`, `/barbearia/*`. Protegidas pelo middleware e, quando necessário, por `auth()` no layout ou na API.
- **APIs:** Todas em `src/app/api/`. As que precisam de usuário chamam `auth()` ou `requireBarbeariaAccess()` e retornam 401/403 em caso de falha.
