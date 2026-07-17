import { supabase } from '../lib/supabase';

// Registra que o cartão NFC foi aproximado de um checkpoint
export async function registrarScan(profileId: string, checkpoint: string) {
  const { error } = await supabase
    .from('nfc_scans')
    .insert([{ 
      profile_id: profileId,
      checkpoint: checkpoint
    }]);

  if (error) throw error;
  return true;
}

// Busca todos os acessos para renderizar no Dashboard
export async function buscarTodosScans() {
  const { data, error } = await supabase
    .from('nfc_scans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}