import { supabase } from '../lib/supabase';

// Busca as informações de um perfil pelo ID
export async function buscarPerfil(id: string) {
  const { data, error } = await supabase
    .from('nfc_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Atualiza os dados do perfil na ativação do cartão
export async function ativarPerfil(id: string, dados: { nome: string; whatsapp: string; link_instagram: string }) {
  const { error } = await supabase
    .from('nfc_profiles')
    .update({
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      link_instagram: dados.link_instagram,
    })
    .eq('id', id);

  if (error) throw error;
  return true;
}