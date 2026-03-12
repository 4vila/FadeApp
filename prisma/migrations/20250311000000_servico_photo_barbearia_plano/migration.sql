-- AlterTable Servico: add photo if missing (some DBs may have been created without it)
ALTER TABLE "Servico" ADD COLUMN IF NOT EXISTS "photo" TEXT;

-- AlterTable Barbearia: plano e ativo
ALTER TABLE "Barbearia" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Barbearia" ADD COLUMN IF NOT EXISTS "planoVencidoEm" TIMESTAMP(3);
ALTER TABLE "Barbearia" ADD COLUMN IF NOT EXISTS "planoTipo" TEXT;
