/**
 * Cria o bucket "fotos" no Supabase Storage (acesso público de leitura).
 * Rode uma vez após configurar NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.
 *
 * Uso: npx dotenv -e .env -- npx tsx scripts/create-storage-bucket.ts
 * Ou: npx tsx scripts/create-storage-bucket.ts  (carrega .env se existir)
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "fotos";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error(
      "Erro: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY) no .env"
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" já existe.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
  });

  if (error) {
    console.error("Erro ao criar bucket:", error.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET}" criado com sucesso.`);
}

main();
