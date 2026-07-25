import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, DadosPerfil } from "../types/profile";

/**
 * Busca o perfil pelo ID (internal_code do cartão).
 * Retorna null se o cartão ainda não tiver perfil (ou não estiver ativado),
 * pra página de perfil decidir se redireciona pra /ativar.
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
      console.error("[ProfileService] Perfil não encontrado para o id:", id, error?.message);
      return null;
    }

    return data as Profile;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao buscar perfil:", e);
    return null;
  }
}

/**
 * Ativa um cartão virgem e o vincula ao usuário autenticado (ownerId).
 * Cria/atualiza o asset correspondente e vincula a tag física, se houver.
 *
 * IMPORTANTE: `ownerId` precisa ser o `auth.uid()` do usuário que já está
 * logado no momento da chamada — esta função NUNCA cria conta, só reivindica
 * um perfil para uma conta que já existe (ver app/ativar/page.tsx, que decide
 * entre FormularioNovaConta e FormularioDadosCartao dependendo se já existe
 * sessão). A política de RLS de `nfc_profiles` só permite este UPDATE se a
 * linha ainda não tiver dono (owner_id is null) e se o valor final de
 * owner_id for o do próprio usuário — então mesmo que este código seja
 * alterado no futuro, o banco não deixa uma pessoa "roubar" o perfil de outra.
 */
export async function ativarPerfil(
  supabase: SupabaseClient,
  id: string,
  ownerId: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id || !ownerId) return false;

  try {
    // 1. Atualiza os dados do cliente e marca o dono do perfil
    const { error: profileError } = await supabase
      .from("nfc_profiles")
      .update({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        link_instagram: dados.link_instagram,
        owner_id: ownerId,
      })
      .eq("id", id);

    if (profileError) {
      console.error("[ProfileService] Erro ao atualizar perfil:", profileError.message);
      return false;
    }

    // 2. Cria ou vincula o cartão físico na tabela assets automaticamente.
    // O upsert insere uma linha nova, ou atualiza se o 'internal_code' já existir.
    const { error: assetError } = await supabase
      .from("assets")
      .upsert(
        {
          internal_code: id,
          type: "NFC_CARD",
          profile_id: id,
        },
        { onConflict: "internal_code" }
      );

    if (assetError) {
      console.error("[ProfileService] Erro ao criar/vincular asset automaticamente:", assetError.message);
      // Não bloqueia a ativação do cliente, mas fica registrado no terminal.
    }

    // 3. Vincula a tag física à qual esta ativação corresponde, se houver uma
    // (id de link direto não tem tag física — o UPDATE simplesmente afeta 0
    // linhas nesse caso, sem erro). Fica aqui, e não em cada formulário, para
    // os dois fluxos de ativação (com ou sem sessão já existente) chamarem só
    // esta função e nunca ficarem fora de sincronia entre si.
    const { error: tagError } = await supabase
      .from("tags")
      .update({ profile_id: id })
      .eq("code", id);

    if (tagError) {
      console.error("[ProfileService] Aviso: não foi possível vincular a tag no banco.", tagError.message);
    }

    return true;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao ativar:", e);
    return false;
  }
}