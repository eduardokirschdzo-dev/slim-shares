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

  // registrarScan exige o client Supabase como 1º argumento — antes faltava
  // aqui, o que impede o build (arity errada) e faz o scan nunca ser gravado.
  await registrarScan(supabaseAuth, tag, cp);

  const analyticsData = await fetchAnalytics(supabaseAuth, id);
  const isOwner = await verificarDono(supabaseAuth, perfilData);

  // perfilData já vem tipado como Profile por buscarPerfil — não precisa de
  // cast `any` nem de reler um campo fora do tipo ("foto.url"). Se a coluna
  // do banco realmente tiver esse nome, o problema está no schema/tipo, não
  // aqui (ver observação no diagnóstico).
  const perfil = perfilData;

  // Prop precisa se chamar "isOwner" — é o nome que ProfileClient espera.
  // Antes ia "podeEditar", que não existe na interface do componente, então
  // o dono nunca recebia a flag e os controles de edição nunca apareciam.
  return <ProfileClient initialProfile={perfil} analytics={analyticsData} isOwner={isOwner} />;
}

async function fetchAnalytics(supabaseAuth: any, profileId: string): Promise<ProfileAnalytics> {
  try {
    // O nome da função no banco (supabase/migration.sql) é get_profile_analytics,
    // não get_profile_scan_stats — com o nome errado essa chamada sempre cai
    // no catch abaixo e o perfil mostra "Nenhum acesso" mesmo tendo scans.
    const { data, error } = await supabaseAuth
      .rpc('get_profile_analytics', { p_profile_id: profileId })
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

// Usa o owner_id que já está em nfc_profiles (única fonte de verdade sobre
// posse do perfil, protegida por RLS em supabase/migration.sql) em vez de
// consultar tags.client_id — essa coluna/vínculo é preenchido de forma
// best-effort na ativação (services/profileService.ts loga o erro e segue
// em frente se falhar), então usá-la para liberar edição era frágil: um
// dono legítimo podia ficar sem os controles de edição se aquele UPDATE
// específico tivesse falhado silenciosamente no momento da ativação.
async function verificarDono(supabaseAuth: any, perfil: Profile): Promise<boolean> {
  try {
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return false;
    return perfil.owner_id === user.id;
  } catch (e) {
    console.error("Erro ao verificar dono do perfil:", e);
    return false;
  }
}