import { supabase } from '../lib/supabase';

/**
 * Registra a interação com um ativo (asset).
 */
export async function registrarScan(internalCode: string, checkpoint: string) {
  try {
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('id, profile_id')
      .eq('internal_code', internalCode)
      .single();

    if (assetError || !asset) {
      throw new Error('Ativo não encontrado na base de dados.');
    }

    const { error: eventError } = await supabase
      .from('asset_events')
      .insert([{
        asset_id: asset.id,
        event_type: 'SCAN',
        checkpoint_name: checkpoint
      }]);

    if (eventError) throw eventError;

    return { success: true, profileId: asset.profile_id };
  } catch (error: any) {
    console.error('Erro ao registrar scan:', error.message);
    throw error;
  }
}

/**
 * Busca todos os acessos históricos (para o perfil)
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

/**
 * NOVA FUNÇÃO PARA O DASHBOARD:
 * Busca o relatório completo usando a View criada no banco.
 */
export async function buscarRelatorioEventos() {
  const { data, error } = await supabase
    .from('view_eventos_com_perfil')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}