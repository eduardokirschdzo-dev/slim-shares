import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { buscarPerfil } from '../../../services/profileService';
import { registrarScan } from '../../../services/checkpointService';
import ProfileClient from './ProfileClient';
import type { Profile, ProfileAnalytics } from '../../../types/profile';
import type { SupabaseClient } from '@supabase/supabase-js';

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

  const supabase = await createClient();

  // 1. SMART REDIRECT (Ativação de Produto Virgem)
  if (id === 'virgem') {
    redirect(`/ativar?tag=${tag}`);
  }

  // 2. BUSCA O PERFIL
  const perfilData = await buscarPerfil(supabase, id);

  if (!perfilData || !perfilData.nome) {
    redirect(`/ativar?tag=${tag}`);
  }

  // 3. REGISTRA O SCAN E ESPERA TERMINAR (Isso corrige o bug da contagem!)
  await registrarScan(supabase, tag, cp);

  // 4. AGORA BUSCA O ANALYTICS (Garante que o scan anterior já foi somado)
  const analyticsData = await fetchAnalytics(supabase, id);

  // 5. Descobre se quem está vendo a página é o dono do perfil
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = !!user && !!perfilData.owner_id && user.id === perfilData.owner_id;

  // Tratamento da tipagem e do bug da foto legada
  const perfil = {
    ...perfilData,
    foto_url: (perfilData as any)["foto.url"] || perfilData.foto_url,
  } as Profile;

  // 6. ENTREGA O HTML PRONTO PARA O CLIENTE
  return <ProfileClient initialProfile={perfil} analytics={analyticsData} isOwner={isOwner} />;
}

// Lógica de Analytics isolada e segura rodando no servidor.
//
// IMPORTANTE: isso usa a função `get_profile_analytics` (ver supabase/migration.sql),
// e não uma leitura direta da tabela de eventos. A tabela de eventos só pode ser lida
// por admins (dados de todos os perfis são sensíveis) — mas cada perfil precisa
// mostrar sua PRÓPRIA contagem agregada publicamente. A função no banco resolve isso:
// ela roda com privilégio elevado (SECURITY DEFINER) e devolve só o total + a data do
// último acesso de UM perfil específico, nunca a lista de eventos crua.
async function fetchAnalytics(
  supabase: SupabaseClient,
  profileId: string
): Promise<ProfileAnalytics> {
  try {
    const { data, error } = await supabase
      .rpc('get_profile_analytics', { p_profile_id: profileId })
      .single();

    if (error) throw error;

    const totalAcessos = Number((data as any)?.total_acessos ?? 0);
    const ultimoAcessoRaw = (data as any)?.ultimo_acesso as string | null;

    let ultimoAcesso = 'Nenhum acesso';
    if (ultimoAcessoRaw) {
      const dataUltimo = new Date(ultimoAcessoRaw);
      const diffMinutos = Math.floor((Date.now() - dataUltimo.getTime()) / 60000);

      if (diffMinutos < 1) ultimoAcesso = 'Agora mesmo';
      else if (diffMinutos < 60) ultimoAcesso = `há ${diffMinutos} min`;
      else if (diffMinutos < 1440) ultimoAcesso = `há ${Math.floor(diffMinutos / 60)}h`;
      else ultimoAcesso = `há ${Math.floor(diffMinutos / 1440)} dias`;
    }

    return { totalAcessos, ultimoAcesso };
  } catch (e) {
    console.error("Erro ao puxar dados de analytics:", e);
    return { totalAcessos: 0, ultimoAcesso: 'Nenhum acesso' };
  }
}
