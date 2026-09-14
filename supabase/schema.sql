-- "O que há de Bom" — esquema do Supabase
-- Rode este script inteiro no SQL Editor do seu projeto Supabase (Database > SQL Editor).

create extension if not exists pgcrypto;

create table if not exists public.historias (
  id uuid primary key default gen_random_uuid(),
  faixa_etaria text not null check (faixa_etaria in ('10-16', '17-20', '21-30', '31-40', '41-50', '51-60')),
  cor text not null check (cor in ('azul', 'amarelo', 'vermelho', 'roxo', 'verde', 'laranja')),
  titulo text,
  texto text not null,
  audio_url text,
  created_at timestamptz not null default now()
);

-- Se a tabela já existia (de uma versão anterior deste schema), garante a coluna nova:
alter table public.historias add column if not exists audio_url text;

create index if not exists historias_faixa_cor_idx on public.historias (faixa_etaria, cor);

alter table public.historias enable row level security;

-- Leitura pública (o app do jogador não faz login)
drop policy if exists "historias_select_public" on public.historias;
create policy "historias_select_public"
  on public.historias
  for select
  to anon, authenticated
  using (true);

-- Escrita restrita a usuários autenticados (o admin)
drop policy if exists "historias_insert_authenticated" on public.historias;
create policy "historias_insert_authenticated"
  on public.historias
  for insert
  to authenticated
  with check (true);

drop policy if exists "historias_update_authenticated" on public.historias;
create policy "historias_update_authenticated"
  on public.historias
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "historias_delete_authenticated" on public.historias;
create policy "historias_delete_authenticated"
  on public.historias
  for delete
  to authenticated
  using (true);

-- Bucket de Storage para os MP3 opcionais (upload feito pelo admin)
insert into storage.buckets (id, name, public)
values ('audios', 'audios', true)
on conflict (id) do nothing;

drop policy if exists "audios_select_public" on storage.objects;
create policy "audios_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'audios');

drop policy if exists "audios_insert_authenticated" on storage.objects;
create policy "audios_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'audios');

drop policy if exists "audios_update_authenticated" on storage.objects;
create policy "audios_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'audios')
  with check (bucket_id = 'audios');

drop policy if exists "audios_delete_authenticated" on storage.objects;
create policy "audios_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'audios');

-- Depois de rodar este script, crie o usuário admin em:
-- Authentication > Users > Add user (email + senha)
-- Esse será o login usado em /admin/login no app.
