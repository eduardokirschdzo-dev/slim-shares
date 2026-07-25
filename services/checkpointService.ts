import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Registra a interação com um ativo (asset) sem travar a renderização.
 * Chamado a partir do Server Component da página de perfil, com o client
 * criado por lib/supabase/server — funciona para visitantes anônimos porque
 * a política de RLS de `asset_events` permite INSERT público (é só um log
 * de scan, sem dado sensível), mas não permite leitura pública.
 */
export async function registrarScan(
  supabase: SupabaseClient,
  internalCode: string,
  checkpoint: string
) {
  if (!internalCode || !checkpoint) {
    console.warn("[CheckpointService] Código interno ou checkpoint ausente.");
    return { success: false };
  }

  try {
    console.log("[CheckpointService] Tentando registrar scan para tag:", internalCode);

    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("id, profile_id")
      .eq("internal_code", internalCode)
      .single();

    if (assetError || !asset) {
      console.error("[CheckpointService] ERRO: Ativo não encontrado na tabela 'assets' para o código:", internalCode);
      return { success: false };
    }

    const { error: eventError } = await supabase
      .from("asset_events")
      .insert([
        {
          asset_id: asset.id,
          event_type: "SCAN",
          checkpoint_name: checkpoint,
        },
      ]);

    if (eventError) {
      console.error("[CheckpointService] Falha ao registrar evento na tabela 'asset_events':", eventError.message);
      return { success: false };
    }

    console.log("[CheckpointService] Scan registrado com sucesso para o ativo:", asset.id);
    return {
      success: true,
      assetId: asset.id,
      profileId: asset.profile_id,
    };
  } catch (e) {
    console.error("[CheckpointService] Falha crítica de conexão no scan:", e);
    return { success: false };
  }
}

/**
 * Busca todos os acessos históricos. Só retorna dado de fato para usuários
 * admin — a política de RLS de `asset_events`/`assets` bloqueia leitura
 * para todo o resto.
 */
export async function buscarTodosScans(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase
      .from("asset_events")
      .select(`
        id,
        checkpoint_name,
        created_at,
        assets (
          internal_code
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CheckpointService] Erro ao buscar scans:", error.message);
      return [];
    }

    return data ?? [];
  } catch (e) {
    console.error("[CheckpointService] Falha inesperada ao buscar scans:", e);
    return [];
  }
}

/**
 * Busca o relatório completo para o Dashboard (/painel). Protegido em duas
 * camadas: o middleware.ts só deixa admins chegarem na rota, e a política de
 * RLS da view também exige ser admin para retornar linhas.
 */
export async function buscarRelatorioEventos(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase
      .from("view_eventos_com_perfil")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CheckpointService] Erro na View do relatório:", error.message);
      return [];
    }

    return data ?? [];
  } catch (e) {
    console.error("[CheckpointService] Falha inesperada no relatório:", e);
    return [];
  }
}
