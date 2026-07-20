import { supabase } from "../lib/supabase";

/**
 * Registra a interação com um ativo (asset) sem travar a renderização.
 */
export async function registrarScan(internalCode: string, checkpoint: string) {
  if (!internalCode || !checkpoint) {
    console.warn("[CheckpointService] Código interno ou checkpoint ausente.");
    return { success: false };
  }

  try {
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("id, profile_id")
      .eq("internal_code", internalCode)
      .single();

    if (assetError || !asset) {
      console.error("[CheckpointService] Ativo não encontrado no Supabase.");
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
      console.error("[CheckpointService] Falha ao registrar evento:", eventError.message);
      return { success: false };
    }

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
 * Busca todos os acessos históricos blindados.
 */
export async function buscarTodosScans() {
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
 * Busca o relatório completo para o Dashboard com proteção de retorno vazio.
 */
export async function buscarRelatorioEventos() {
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