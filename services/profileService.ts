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

/**
 * Ativa um cartão virgem e o vincula ao usuário autenticado (userId).
 *
 * IMPORTANTE: `userId` precisa ser o `auth.uid()` do usuário que já está
 * logado no momento da chamada. A política de RLS de `nfc_profiles` só permite
 * este UPDATE se a linha ainda não tiver dono (owner_id is null) e se o valor
 * final de owner_id for o do próprio usuário — então mesmo que este código
 * seja alterado no futuro, o banco não deixa uma pessoa "roubar" o cartão
 * de outra (essa proteção está em supabase/migration.sql).
 */
export async function ativarPerfil(
  supabase: any,
  id: string,
  userId: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id || !userId) return false;

  try {
    // 1. Atualiza os dados do perfil E reivindica o cartão pro usuário (owner_id)
    const { error: profileError } = await supabase
      .from("nfc_profiles")
      .update({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        link_instagram: dados.link_instagram,
        owner_id: userId, // ← CRÍTICO: reivindica o cartão pro usuário
      })
      .eq("id", id);

    if (profileError) {
      console.error("[ProfileService] Erro ao atualizar perfil:", profileError.message);
      return false;
    }

    // 2. Cria/atualiza o asset correspondente (registro de propriedade do ativo físico)
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
      // Não bloqueia a ativação do cliente, mas fica registrado no terminal.
    }

    // 3. Vincula a tag física à qual esta ativação corresponde, se houver uma
    // (um link direto não tem tag física — o UPDATE simplesmente afeta 0
    // linhas nesse caso, sem erro). Fica aqui, e não em cada formulário, para
    // ambos os fluxos de ativação (com ou sem sessão já existente) chamarem
    // apenas esta função e nunca ficarem fora de sincronia entre si.
    const { error: tagError } = await supabase
      .from("tags")
      .update({ profile_id: id })
      .eq("code", id);

    if (tagError) {
      console.error("[ProfileService] Aviso: não foi possível vincular a tag no banco.", tagError.message);
      // Também não bloqueia — é info do lado, não erro crítico.
    }

    return true;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao ativar:", e);
    return false;
  }
}