-- ============================================================================
-- Slim Shares — Migração de segurança (RLS + Autenticação de dono do perfil)
-- ============================================================================
-- Rode este script no SQL Editor do Supabase (Dashboard > SQL Editor).
-- Recomendo testar antes num projeto Supabase separado (ou branch/staging),
-- porque não tenho acesso ao seu banco para validar isso na prática.
--
-- O que este script faz:
--   1. Cria a tabela `admins` (quem pode acessar /painel)
--   2. Adiciona `owner_id` em `nfc_profiles` (dono do perfil = usuário do Auth)
--   3. Liga RLS em todas as tabelas e define as políticas de acesso
--   4. Cria a função `get_profile_analytics` (estatística pública e segura,
--      sem expor a tabela de eventos inteira)
--   5. Protege as fotos de perfil (bucket `avatars`) para só o dono enviar
-- ============================================================================


-- 1. TABELA DE ADMINS -------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admin ve seu proprio registro" on public.admins;
create policy "admin ve seu proprio registro"
  on public.admins for select
  using (auth.uid() = user_id);

-- Depois de rodar este script, crie sua própria conta normalmente (assinando
-- via /admin/login não funciona sozinho — é só login). Para o PRIMEIRO admin,
-- crie o usuário pelo Dashboard do Supabase (Authentication > Users > Add user)
-- ou faça login uma vez em /entrar com signUp manual, pegue o UUID gerado, e rode:
--
--   insert into public.admins (user_id) values ('COLE-O-UUID-AQUI');


-- 2. OWNER_ID EM NFC_PROFILES ------------------------------------------------
alter table public.nfc_profiles
  add column if not exists owner_id uuid references auth.users(id);

-- Perfis que já estavam ativos ANTES desta migração ficam com owner_id nulo
-- (ninguém consegue editá-los pela UI até você reivindicar manualmente).
-- Para migrar um perfil legado depois que o criador já tiver uma conta:
--
--   update public.nfc_profiles set owner_id = 'UUID-DO-USUARIO' where id = 'ID-DO-PERFIL';


-- 3. RLS: NFC_PROFILES --------------------------------------------------------
alter table public.nfc_profiles enable row level security;

drop policy if exists "qualquer um pode ver perfis" on public.nfc_profiles;
create policy "qualquer um pode ver perfis"
  on public.nfc_profiles for select
  using (true); -- a página de perfil é pública, precisa ser legível por visitantes

drop policy if exists "reivindicar perfil sem dono" on public.nfc_profiles;
create policy "reivindicar perfil sem dono"
  on public.nfc_profiles for update
  using (owner_id is null)
  with check (auth.uid() = owner_id);

drop policy if exists "dono edita seu proprio perfil" on public.nfc_profiles;
create policy "dono edita seu proprio perfil"
  on public.nfc_profiles for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "admins tem acesso total aos perfis" on public.nfc_profiles;
create policy "admins tem acesso total aos perfis"
  on public.nfc_profiles for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));


-- 4. RLS: ASSETS --------------------------------------------------------------
alter table public.assets enable row level security;

drop policy if exists "qualquer um pode ler assets" on public.assets;
create policy "qualquer um pode ler assets"
  on public.assets for select
  using (true); -- necessário para o registro do scan encontrar o cartão pelo código

drop policy if exists "dono cria o asset do seu proprio perfil" on public.assets;
create policy "dono cria o asset do seu proprio perfil"
  on public.assets for insert
  with check (
    exists (
      select 1 from public.nfc_profiles p
      where p.id = assets.profile_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "dono atualiza o asset do seu proprio perfil" on public.assets;
create policy "dono atualiza o asset do seu proprio perfil"
  on public.assets for update
  using (
    exists (
      select 1 from public.nfc_profiles p
      where p.id = assets.profile_id and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.nfc_profiles p
      where p.id = assets.profile_id and p.owner_id = auth.uid()
    )
  );

drop policy if exists "admins gerenciam assets" on public.assets;
create policy "admins gerenciam assets"
  on public.assets for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));


-- 5. RLS: ASSET_EVENTS (dados sensíveis, só admin lê) -------------------------
alter table public.asset_events enable row level security;

drop policy if exists "qualquer um pode registrar um scan" on public.asset_events;
create policy "qualquer um pode registrar um scan"
  on public.asset_events for insert
  with check (true); -- log público de scan (sem dado pessoal, só o evento)

drop policy if exists "somente admins leem eventos" on public.asset_events;
create policy "somente admins leem eventos"
  on public.asset_events for select
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()));

-- Sem policy de update/delete: por padrão o RLS bloqueia (registro é append-only).


-- 6. RLS: TAGS -----------------------------------------------------------------
alter table public.tags enable row level security;

drop policy if exists "dono vincula sua tag na ativacao" on public.tags;
create policy "dono vincula sua tag na ativacao"
  on public.tags for update
  using (
    profile_id is null
    and exists (
      select 1 from public.nfc_profiles p
      where p.id = tags.code and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.nfc_profiles p
      where p.id = tags.code and p.owner_id = auth.uid()
    )
  );

drop policy if exists "admins gerenciam tags" on public.tags;
create policy "admins gerenciam tags"
  on public.tags for all
  using (exists (select 1 from public.admins where admins.user_id = auth.uid()))
  with check (exists (select 1 from public.admins where admins.user_id = auth.uid()));


-- 7. VIEW DO PAINEL: respeitar RLS de quem consulta ---------------------------
-- Sem isso, a view roda com o dono da view (geralmente superusuário) e ignora
-- as políticas acima — precisa do security_invoker para herdar as regras de
-- quem está de fato chamando a query (Postgres 15+/Supabase suporta isso).
alter view public.view_eventos_com_perfil set (security_invoker = true);


-- 8. FUNÇÃO PÚBLICA E SEGURA DE ANALYTICS POR PERFIL --------------------------
-- Cada página de perfil mostra o total de acessos e o último acesso PARA
-- AQUELE perfil, publicamente. Só isso — nunca a lista de eventos crua nem
-- dados de outros perfis. SECURITY DEFINER faz a função rodar com privilégio
-- elevado internamente, mas ela só devolve um número e uma data agregados.
create or replace function public.get_profile_analytics(p_profile_id text)
returns table (total_acessos bigint, ultimo_acesso timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_acessos,
    max(ae.created_at) as ultimo_acesso
  from asset_events ae
  join assets a on a.id = ae.asset_id
  where a.profile_id = p_profile_id;
$$;

grant execute on function public.get_profile_analytics(text) to anon, authenticated;


-- 9. STORAGE: bucket "avatars" -------------------------------------------------
-- Leitura pública (a foto aparece na página do perfil para qualquer visitante),
-- mas só o dono do perfil pode enviar/atualizar o arquivo correspondente.
drop policy if exists "leitura publica dos avatares" on storage.objects;
create policy "leitura publica dos avatares"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "dono envia foto do proprio perfil" on storage.objects;
create policy "dono envia foto do proprio perfil"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.nfc_profiles p
      where p.owner_id = auth.uid()
        and name like 'avatars/' || p.id || '%'
    )
  );

drop policy if exists "dono atualiza foto do proprio perfil" on storage.objects;
create policy "dono atualiza foto do proprio perfil"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.nfc_profiles p
      where p.owner_id = auth.uid()
        and name like 'avatars/' || p.id || '%'
    )
  );

-- ============================================================================
-- FIM. Próximos passos manuais (fora deste script):
--
-- 1. Crie sua conta de admin (via /entrar, criando um usuário qualquer com
--    signUp — ou pelo Dashboard) e rode o INSERT na tabela admins (passo 1).
-- 2. Se você já tem perfis ativos de antes desta migração, rode o UPDATE
--    de owner_id (passo 2) para cada um, depois que o criador tiver conta.
-- 3. Em Authentication > Settings, decida se quer exigir confirmação de
--    e-mail no cadastro. Se deixar exigindo, o fluxo de /ativar mostra uma
--    tela pedindo para confirmar o e-mail e voltar em /entrar depois.
-- ============================================================================
