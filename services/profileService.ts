import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, DadosPerfil } from "../types/profile";

/**
 * Busca um perfil pelo ID.
 *
 * Exemplo:
 * /perfil/02
 *
 * -> busca nfc_profiles.id = "02"
 */
export async function buscarPerfil(
  supabase: SupabaseClient,
  id: string
): Promise<Profile | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("nfc_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error(
        "[ProfileService] Perfil não encontrado:",
        id,
        error?.message
      );

      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error(
      "[ProfileService] Falha inesperada ao buscar perfil:",
      error
    );

    return null;
  }
}

/**
 * Ativa um perfil virgem e vincula o perfil
 * ao usuário autenticado.
 *
 * Fluxo:
 *
 * usuário
 *    ↓
 * nfc_profiles.owner_id
 *    ↓
 * nfc_profiles.id
 *    ↓
 * assets.profile_id
 *
 * IMPORTANTE:
 *
 * O código físico do NFC (ex: DRUW_001) NÃO é o ID
 * do perfil (ex: 02).
 *
 * Portanto, esta função NÃO cria um novo asset.
 *
 * O asset físico já existe:
 *
 * DRUW_001 → profile_id 02
 *
 * A ativação apenas:
 *
 * 1. reivindica o perfil através do owner_id
 * 2. atualiza os dados do perfil
 * 3. garante que o asset correspondente esteja ATIVADO
 */
export async function ativarPerfil(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id || !userId) {
    console.error(
      "[ProfileService] ID do perfil ou userId ausente."
    );

    return false;
  }

  try {
    /**
     * =========================================================
     * 1. VERIFICA O PERFIL
     * =========================================================
     */

    const { data: perfil, error: perfilError } = await supabase
      .from("nfc_profiles")
      .select("id, owner_id")
      .eq("id", id)
      .single();

    if (perfilError || !perfil) {
      console.error(
        "[ProfileService] Perfil não encontrado para ativação:",
        id,
        perfilError?.message
      );

      return false;
    }

    /**
     * Se o perfil já pertence a outro usuário,
     * não permitimos que seja reivindicado novamente.
     */

    if (perfil.owner_id && perfil.owner_id !== userId) {
      console.error(
        "[ProfileService] Perfil já pertence a outro usuário:",
        id
      );

      return false;
    }

    /**
     * =========================================================
     * 2. ATIVA / REIVINDICA O PERFIL
     * =========================================================
     */

    const { error: updateError } = await supabase
      .from("nfc_profiles")
      .update({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        link_instagram: dados.link_instagram,
        owner_id: userId,
      })
      .eq("id", id)
      .is("owner_id", null);

    if (updateError) {
      console.error(
        "[ProfileService] Erro ao reivindicar perfil:",
        updateError.message
      );

      return false;
    }

    /**
     * =========================================================
     * 3. LOCALIZA O ASSET FÍSICO DO PERFIL
     * =========================================================
     *
     * Exemplo real do seu banco:
     *
     * internal_code = DRUW_001
     * profile_id    = 02
     *
     * NÃO usamos client_id porque essa coluna não existe.
     */

    const { data: assets, error: assetSearchError } = await supabase
      .from("assets")
      .select("id, internal_code, profile_id, type, status")
      .eq("profile_id", id);

    if (assetSearchError) {
      console.error(
        "[ProfileService] Erro ao localizar asset:",
        assetSearchError.message
      );

      /**
       * O perfil já foi ativado.
       * Portanto não retornamos false aqui.
       */
    } else if (!assets || assets.length === 0) {
      console.warn(
        "[ProfileService] Nenhum asset encontrado para o perfil:",
        id
      );
    } else {
      /**
       * =======================================================
       * 4. ATIVA OS ASSETS VINCULADOS AO PERFIL
       * =======================================================
       */

      const { error: assetUpdateError } = await supabase
        .from("assets")
        .update({
          status: "ATIVADO",
        })
        .eq("profile_id", id);

      if (assetUpdateError) {
        console.error(
          "[ProfileService] Erro ao atualizar status do asset:",
          assetUpdateError.message
        );
      } else {
        console.log(
          "[ProfileService] Asset(s) ativado(s) para o perfil:",
          id,
          assets.map((asset) => asset.internal_code)
        );
      }
    }

    /**
     * =========================================================
     * 5. FINAL
     * =========================================================
     */

    console.log(
      "[ProfileService] Perfil ativado com sucesso:",
      id,
      "→ usuário:",
      userId
    );

    return true;
  } catch (error) {
    console.error(
      "[ProfileService] Falha inesperada durante ativação:",
      error
    );

    return false;
  }
}