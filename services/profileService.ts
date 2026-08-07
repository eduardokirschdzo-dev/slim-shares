import type { Profile, DadosPerfil } from "../types/profile";

export async function buscarPerfil(supabase: any, id: string): Promise<Profile | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("nfc_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("[ProfileService] Perfil não encontrado para o id:", id, error?.message);
      return null;
    }

    return data as Profile;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao buscar perfil:", e);
    return null;
  }
}

export async function ativarPerfil(
  supabase: any,
  id: string,
  userId: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id) return false;

  try {
    const { error: profileError } = await supabase
      .from("nfc_profiles")
      .update({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        link_instagram: dados.link_instagram,
      })
      .eq("id", id);

    if (profileError) {
      console.error("[ProfileService] Erro ao atualizar perfil:", profileError.message);
      return false;
    }

    const { error: assetError } = await supabase
      .from("assets")
      .upsert(
        {
          internal_code: id,
          type: "NFC_CARD",
          profile_id: id,
          client_id: userId,
        },
        { onConflict: "internal_code" }
      );

    if (assetError) {
      console.error("[ProfileService] Erro ao criar/vincular asset automaticamente:", assetError.message);
    }

    return true;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao ativar:", e);
    return false;
  }
}