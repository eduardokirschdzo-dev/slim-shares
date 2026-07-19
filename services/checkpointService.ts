import { supabase } from "../lib/supabase";

/**
 * Registra a interação com um ativo (asset).
 */
export async function registrarScan(
  internalCode: string,
  checkpoint: string
) {
  if (!internalCode) {
    throw new Error("Código interno não informado.");
  }

  if (!checkpoint) {
    throw new Error("Checkpoint não informado.");
  }

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id, profile_id")
    .eq("internal_code", internalCode)
    .single();

  if (assetError || !asset) {
    throw new Error("[CheckpointService] Ativo não encontrado.");
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
    throw new Error(
      `[CheckpointService] ${eventError.message}`
    );
  }

  return {
    success: true,
    assetId: asset.id,
    profileId: asset.profile_id,
  };
}

/**
 * Busca todos os acessos históricos.
 */
export async function buscarTodosScans() {
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
    throw new Error(
      `[CheckpointService] ${error.message}`
    );
  }

  return data ?? [];
}

/**
 * Busca o relatório completo para o Dashboard.
 */
export async function buscarRelatorioEventos() {
  const { data, error } = await supabase
    .from("view_eventos_com_perfil")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `[CheckpointService] ${error.message}`
    );
  }

  return data ?? [];
}