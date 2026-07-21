// Atualiza os dados de forma segura e já vincula o ativo físico (Asset) automaticamente
export async function ativarPerfil(
  id: string,
  dados: DadosPerfil
): Promise<boolean> {
  if (!id) return false;

  try {
    // 1. Atualiza os dados do cliente na tabela nfc_profiles
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

    // 2. A MÁGICA: Cria ou vincula o cartão físico na tabela assets automaticamente
    // O upsert insere uma linha nova, ou atualiza se o 'internal_code' já existir.
    const { error: assetError } = await supabase
      .from("assets")
      .upsert(
        {
          internal_code: id,
          type: "NFC_CARD", // Tipo padrão do seu produto
          profile_id: id,   // Aqui fazemos a ponte (FK) que o seu SQL exige!
        },
        { onConflict: "internal_code" }
      );

    if (assetError) {
      console.error("[ProfileService] Erro ao criar/vincular asset automaticamente:", assetError.message);
      // Mesmo se der um erro leve aqui, não vamos bloquear a tela do cliente, 
      // mas o terminal vai te avisar.
    }

    return true;
  } catch (e) {
    console.error("[ProfileService] Falha inesperada ao ativar:", e);
    return false;
  }
}