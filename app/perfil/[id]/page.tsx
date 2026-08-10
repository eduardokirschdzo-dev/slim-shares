import { redirect } from 'next/navigation';
import { createClient as createAuthClient } from '../../../lib/supabase/server';
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

  if (id === 'virgem') {
    redirect(`/ativar?tag=${tag}`);
  }

  const supabaseAuth = await createAuthClient();
  const perfilData = await buscarPerfil(supabaseAuth, id);

  if (!perfilData || !perfilData.nome) {
    redirect(`/ativar?tag=${tag}`);
  }

  await registrarScan(tag, cp);

  const analyticsData = await fetchAnalytics(supabaseAuth, id);
  const podeEditar = await verificarDono(supabaseAuth, id);

  const perfil = {
    ...perfilData,
    foto_url: (perfilData as any)["foto.url"] || perfilData.foto_url,
  } as Profile;

  return <ProfileClient initialProfile={perfil} analytics={analyticsData} podeEditar={podeEditar} />;
}

async function fetchAnalytics(supabaseAuth: any, profileId: string): Promise<ProfileAnalytics> {
  try {
    const { data, error } = await supabaseAuth
      .rpc('get_profile_scan_stats', { p_profile_id: profileId })
      .single();

    if (error) throw error;

    const row = data as { total_acessos: number; ultimo_acesso: string | null } | null;

    let ultimoAcesso = 'Nenhum acesso';
    if (row?.ultimo_acesso) {
      const dataUltimo = new Date(row.ultimo_acesso);
      const diffMinutos = Math.floor((Date.now() - dataUltimo.getTime()) / 60000);

      if (diffMinutos < 1) ultimoAcesso = 'Agora mesmo';
      else if (diffMinutos < 60) ultimoAcesso = `há ${diffMinutos} min`;
      else if (diffMinutos < 1440) ultimoAcesso = `há ${Math.floor(diffMinutos / 60)}h`;
      else ultimoAcesso = `há ${Math.floor(diffMinutos / 1440)} dias`;
    }

    return { totalAcessos: row?.total_acessos || 0, ultimoAcesso };
  } catch (e) {
    console.error("Erro ao puxar dados de analytics:", e);
    return { totalAcessos: 0, ultimoAcesso: 'Nenhum acesso' };
  }
}

async function verificarDono(supabaseAuth: any, profileId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabaseAuth.auth.getUser();

    if (!user) return false;

    const { data } = await supabaseAuth
      .from('tags')
      .select('id')
      .eq('profile_id', profileId)
      .eq('client_id', user.id)
      .maybeSingle();

    return !!data;
  } catch (e) {
    console.error("Erro ao verificar dono do perfil:", e);
    return false;
  }
}