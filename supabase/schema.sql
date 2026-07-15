-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)

create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  bio text,
  foto_url text,
  whatsapp text,
  created_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "Perfis publicos sao legiveis" on public.perfis;
create policy "Perfis publicos sao legiveis"
  on public.perfis
  for select
  to anon, authenticated
  using (true);

insert into public.perfis (slug, nome, bio, whatsapp)
values
  ('demo', 'Perfil Demo', 'Exemplo de perfil publico no Slim Shares', '5511999999999')
on conflict (slug) do nothing;
