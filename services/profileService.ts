import { supabase } from "../lib/supabase";
import type { Profile } from "../types/profile";

type DadosPerfil = {
  nome: string;
  whatsapp: string;
  link_instagram: string;
};

// Busca as informações blindadas com retorno nulo em caso de falha
export async function buscarPerfil(id: string): Promise<Profile | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("nfc_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      // A Válvula de Segurança atuando: avisa o erro nos bastidores, mas não quebra a tela
      console.error("[ProfileService] Erro ao buscar perfil no Supabase:", error.message);
      return null;
    }

    // O Filtro: Garante que a água que saiu é exatamente do tipo Profile
    return data as Profile;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada no sistema:", e);
    return null;
  }
}

// Atualiza os dados de forma segura
export async function ativarPerfil(
  id: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id) return false;

  try {
    const { error } = await supabase
      .from("nfc_profiles")
      .update({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        link_instagram: dados.link_instagram,
      })
      .eq("id", id);

    if (error) {
      console.error("[ProfileService] Erro ao atualizar perfil:", error.message);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao ativar:", e);
    return false;
  }
}