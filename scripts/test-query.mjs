import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

if (!url || !key) {
  console.error("Variáveis ausentes em .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const columns = "id, slug, nome, bio, foto_url, whatsapp";

console.log("Testando listagem de perfis...");
const { data: perfis, error: listError } = await supabase
  .from("perfis")
  .select(columns)
  .order("nome")
  .limit(5);

if (listError) {
  console.error("Erro na listagem:", listError.message, listError.code);
  process.exit(1);
}

console.log(`Encontrados: ${perfis?.length ?? 0}`);
if (perfis?.[0]) {
  console.log("Primeiro perfil:", perfis[0]);
}

const slug = perfis?.[0]?.slug ?? "demo";
console.log(`\nTestando busca por slug "${slug}"...`);

const { data: perfil, error: getError } = await supabase
  .from("perfis")
  .select(columns)
  .eq("slug", slug)
  .maybeSingle();

if (getError) {
  console.error("Erro na busca:", getError.message, getError.code);
  process.exit(1);
}

if (!perfil) {
  console.log("Nenhum perfil encontrado. Execute supabase/schema.sql no dashboard.");
  process.exit(0);
}

console.log("OK:", perfil.nome);
