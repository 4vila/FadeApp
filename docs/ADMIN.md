# Usuário administrador

## Credenciais (criadas pelo seed)

| Campo  | Valor                  |
|--------|------------------------|
| Nome   | Hares                  |
| Email  | `hares@estetica.local` |
| Senha  | `RaelM040124@`         |
| Role   | `admin`                |

## Como criar ou atualizar

```bash
npm run db:seed
```

## Como usar

1. Acesse a página de login (`/login`).
2. Entre com o email e a senha acima.
3. Use o link **Painel** na navbar para acessar o painel da barbearia (`/barbearia/dashboard`).

O usuário com role `admin` tem acesso ao painel mesmo sem estar vinculado a uma barbearia; no MVP o sistema usa a primeira barbearia do banco. A autenticação e a proteção das rotas `/barbearia` e `/admin` estão configuradas em `src/lib/auth.ts` e `src/middleware.ts`.
