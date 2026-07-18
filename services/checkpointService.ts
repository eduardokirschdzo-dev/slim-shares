import { supabase } from '../lib/supabase';

/**
 * Registra a interação com um ativo (asset).
 * O sistema agora identifica o ativo pelo seu código interno (internal_code)
 * e registra um evento na tabela de histórico (asset_events).
 */
export async function registrarScan(internalCode: string, checkpoint: string) {
  try {
    // 1. Busca o ativo pelo código gravado na tag/objeto
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, profile_id')
      .eq('internal_code', internalCode)
      .single();

    if (assetError || !asset) {
      throw new Error('Ativo não encontrado na base de dados.');
    }

    // 2. Registra o evento de scan na nova tabela de histórico
    const { error: eventError } = await supabase
      .from('asset_events')
      .insert([{
        asset_id: asset.id,
        event_type: 'SCAN',
        checkpoint_name: checkpoint
      }]);

    if (eventError) throw eventError;

    // Retorna o profile_id para que a página saiba qual perfil carregar
    return { success: true, profileId: asset.profile_id };
  } catch (error: any) {
    console.error('Erro ao registrar scan:', error.message);
    throw error;
  }
}

/**
 * Busca todos os acessos históricos para renderizar no Dashboard.
 * Agora faz join com a tabela de assets para sabermos qual objeto foi escaneado.
 */
export async function buscarTodosScans() {
  const { data, error } = await supabase
    .from('asset_events')
    .select(`
      id, 
      checkpoint_name, 
      created_at, 
      assets (internal_code)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}