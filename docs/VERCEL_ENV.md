# Variáveis de ambiente na Vercel (Supabase + NextAuth)

Configure **todas** no painel: Project → Settings → Environment Variables (Production, Preview e Development conforme o uso).

## Obrigatórias para o app funcionar

| Variável | Valor |
|----------|--------|
| `DATABASE_URL` | Connection string do PostgreSQL do Supabase (Session pooler ou direct, com `?sslmode=require` se o provedor exigir). |
| `AUTH_SECRET` | String aleatória longa (mín. 32 caracteres). Gere: `openssl rand -base64 32` ou `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. **Não commite.** |
| `NEXTAUTH_URL` | URL pública do site, ex.: `https://seu-projeto.vercel.app` ou domínio customizado com `https://`. |

Opcional (compatível com NextAuth v4 / Auth.js):

- `NEXTAUTH_SECRET` — pode ser **o mesmo valor** que `AUTH_SECRET` (útil se alguma ferramenta só ler este nome).

Opcional (Auth.js v5):

- `AUTH_URL` — igual a `NEXTAUTH_URL` (mesma URL HTTPS do deploy).

## Upload de fotos (Storage Supabase)

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto (Settings → API). |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (somente servidor; nunca no cliente). |

## Contato / WhatsApp

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | DDD + número, ex.: `5571999999999` (sem `+` ou espaços). |

## Depois de alterar variáveis

Faça um **redeploy** (Deployments → ⋮ → Redeploy) para o servidor carregar os novos valores.

## Login com erro “Configuration”

Quase sempre falta `AUTH_SECRET` (ou está vazio) no ambiente da Vercel, ou `NEXTAUTH_URL` não é a URL **exata** do site (incluindo `https://`).

## Banco de dados

Rode migrações contra o Postgres do Supabase **antes** ou **após** o primeiro deploy (com `DATABASE_URL` do Supabase no seu `.env` local):

```bash
npx prisma migrate deploy
```

Seed (admin de teste), se desejar:

```bash
npx prisma db seed
```
