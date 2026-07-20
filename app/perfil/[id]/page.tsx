import { redirect } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { buscarPerfil } from '../../../services/profileService';
import { registrarScan } from '../../../services/checkpointService';
import ProfileClient from './ProfileClient';
import type { Profile, ProfileAnalytics } from '../../../types/profile';

export default async function PerfilPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;

  const tag = (search.tag as string) || id;
  const cp = (search.cp as string) || 'Geral';

  // 1. SMART REDIRECT (Ativação de Produto Virgem)
  if (id === 'virgem') {
    redirect(`/ativar?tag=${tag}`);
  }

  // 2. ORQUESTRAÇÃO EM PARALELO (Busca dados enquanto registra o scan)
  const profilePromise = buscarPerfil(id);
  const analyticsPromise = fetchAnalytics(id);

  // Fire and forget: Dispara o scan sem travar o carregamento da página
  registrarScan(tag, cp).catch((e) => console.error("Erro no scan (RLS/Tabela):", e));

  const [perfilData, analyticsData] = await Promise.all([
    profilePromise,
    analyticsPromise,
  ]);

  if (!perfilData || !perfilData.nome) {
    redirect(`/ativar?tag=${tag}`);
  }

  // Tratamento da tipagem e do bug da foto legada
  const perfil = {
    ...perfilData,
    foto_url: (perfilData as any)["foto.url"] || perfilData.foto_url,
  } as Profile;

  // 3. ENTREGA O HTML PRONTO PARA O CLIENTE
  return <ProfileClient initialProfile={perfil} analytics={analyticsData} />;
}

// Lógica de Analytics isolada e segura rodando no servidor
async function fetchAnalytics(profileId: string): Promise<ProfileAnalytics> {
  try {
    const { count, data, error } = await supabase
      .from('view_eventos_com_perfil')
      .select('created_at', { count: 'exact' })
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    let ultimoAcesso = 'Nenhum acesso';
    if (data && data.length > 0) {
      const dataUltimo = new Date(data[0].created_at);
      const diffMinutos = Math.floor((Date.now() - dataUltimo.getTime()) / 60000);

      if (diffMinutos < 1) ultimoAcesso = 'Agora mesmo';
      else if (diffMinutos < 60) ultimoAcesso = `há ${diffMinutos} min`;
      else if (diffMinutos < 1440) ultimoAcesso = `há ${Math.floor(diffMinutos / 60)}h`;
      else ultimoAcesso = `há ${Math.floor(diffMinutos / 1440)} dias`;
    }

    return { totalAcessos: count || 0, ultimoAcesso };
  } catch (e) {
    console.error("Erro ao puxar dados de analytics:", e);
    return { totalAcessos: 0, ultimoAcesso: 'Nenhum acesso' };
  }
}