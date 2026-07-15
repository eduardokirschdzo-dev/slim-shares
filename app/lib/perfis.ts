import { supabase } from "@/app/supabaseClient";
import type { Perfil } from "@/app/types/perfil";

const PERFIL_COLUMNS = "id, slug, nome, bio, foto_url, whatsapp" as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPerfilByIdentificador(
  identificador: string,
): Promise<{ perfil: Perfil | null; error: string | null }> {
  const column = UUID_REGEX.test(identificador) ? "id" : "slug";

  const { data, error } = await supabase
    .from("perfis")
    .select(PERFIL_COLUMNS)
    .eq(column, identificador)
    .maybeSingle();

  if (error) {
    console.error("[getPerfilByIdentificador]", error.message, error.code);
    return { perfil: null, error: error.message };
  }

  return { perfil: data, error: null };
}

export async function listPerfis(limit = 20): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("perfis")
    .select(PERFIL_COLUMNS)
    .order("nome")
    .limit(limit);

  if (error) {
    console.error("[listPerfis]", error.message, error.code);
    return [];
  }

  return data ?? [];
}
