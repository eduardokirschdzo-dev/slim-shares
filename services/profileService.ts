import { supabase } from "../lib/supabase";
import type { Profile } from "../types/profile";
type DadosPerfil = {
  nome: string;
  whatsapp: string;
  link_instagram: string;
};

// Busca as informações de um perfil pelo ID
export async function buscarPerfil(id: string): Promise<Profile> {
  if (!id) {
    throw new Error("ID do perfil não informado.");
  }

  const { data, error } = await supabase
    .from("nfc_profiles")
    .select("*")
    .eq("id", id)
    .single();
const perfil = data as Profile;
  if (error) {
    throw new Error(`Erro ao buscar perfil: ${error.message}`);
  }

 return perfil;
}

// Atualiza os dados do perfil na ativação do cartão
export async function ativarPerfil(
  id: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id) {
    throw new Error("ID do perfil não informado.");
  }

  const { error } = await supabase
    .from("nfc_profiles")
    .update({
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      link_instagram: dados.link_instagram,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  }

  return true;
}