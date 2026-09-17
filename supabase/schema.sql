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
  imagem_url text,
  created_at timestamptz not null default now()
);

-- Se a tabela já existia (de uma versão anterior deste schema), garante as colunas novas:
alter table public.historias add column if not exists audio_url text;
alter table public.historias add column if not exists imagem_url text;
alter table public.historias add column if not exists genero_narrador text;
alter table public.historias drop constraint if exists historias_genero_narrador_check;
alter table public.historias add constraint historias_genero_narrador_check
  check (genero_narrador is null or genero_narrador in ('feminino', 'masculino'));
-- true = MP3 enviado manualmente pelo admin (nunca sobrescrito pelo "Aplicar em massa" de vozes);
-- false = áudio gerado automaticamente pela IA (pode ser regenerado em massa).
alter table public.historias add column if not exists audio_manual boolean not null default false;

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

-- Bucket de Storage para as imagens opcionais (upload feito pelo admin)
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do nothing;

drop policy if exists "imagens_select_public" on storage.objects;
create policy "imagens_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'imagens');

drop policy if exists "imagens_insert_authenticated" on storage.objects;
create policy "imagens_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'imagens');

drop policy if exists "imagens_update_authenticated" on storage.objects;
create policy "imagens_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'imagens')
  with check (bucket_id = 'imagens');

drop policy if exists "imagens_delete_authenticated" on storage.objects;
create policy "imagens_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'imagens');

-- Histórias dos professores — tabela separada da dos alunos (público e faixas diferentes)
create table if not exists public.historias_professores (
  id uuid primary key default gen_random_uuid(),
  faixa text not null check (faixa in ('12-35', '35-40')),
  cor text not null check (cor in ('azul', 'amarelo', 'vermelho', 'roxo', 'verde', 'laranja')),
  titulo text,
  texto text not null,
  audio_url text,
  imagem_url text,
  genero_narrador text check (genero_narrador is null or genero_narrador in ('feminino', 'masculino')),
  audio_manual boolean not null default false,
  created_at timestamptz not null default now()
);

-- Se a tabela já existia (de uma versão anterior deste schema), garante as colunas novas:
alter table public.historias_professores add column if not exists genero_narrador text;
alter table public.historias_professores drop constraint if exists historias_professores_genero_narrador_check;
alter table public.historias_professores add constraint historias_professores_genero_narrador_check
  check (genero_narrador is null or genero_narrador in ('feminino', 'masculino'));
alter table public.historias_professores add column if not exists audio_manual boolean not null default false;

create index if not exists historias_professores_faixa_cor_idx on public.historias_professores (faixa, cor);

alter table public.historias_professores enable row level security;

-- Conteúdo de professor só é visível pra quem está logado (o app exige login antes dessa tela)
drop policy if exists "historias_professores_select_authenticated" on public.historias_professores;
create policy "historias_professores_select_authenticated"
  on public.historias_professores
  for select
  to authenticated
  using (true);

drop policy if exists "historias_professores_insert_authenticated" on public.historias_professores;
create policy "historias_professores_insert_authenticated"
  on public.historias_professores
  for insert
  to authenticated
  with check (true);

drop policy if exists "historias_professores_update_authenticated" on public.historias_professores;
create policy "historias_professores_update_authenticated"
  on public.historias_professores
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "historias_professores_delete_authenticated" on public.historias_professores;
create policy "historias_professores_delete_authenticated"
  on public.historias_professores
  for delete
  to authenticated
  using (true);

-- Reaproveita os buckets 'audios' e 'imagens' já criados acima (as políticas de storage
-- são por bucket, não por tabela, então já cobrem os uploads dessa tabela também).

-- Usuários do app (admin, professor, aluno) — um perfil por usuário do Supabase Auth.
create table if not exists public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  email text not null,
  papel text not null check (papel in ('admin', 'professor', 'aluno')),
  created_at timestamptz not null default now()
);

create index if not exists usuarios_papel_idx on public.usuarios (papel);

alter table public.usuarios enable row level security;

-- Cada usuário pode ler só o próprio perfil — é o que o app usa pra saber se quem está logado
-- é admin, professor ou aluno (e assim bloquear professor/aluno de entrar em /admin).
drop policy if exists "usuarios_select_self" on public.usuarios;
create policy "usuarios_select_self"
  on public.usuarios
  for select
  to authenticated
  using (id = auth.uid());

-- Fora isso, sem políticas de insert/update/delete pra anon/authenticated de propósito:
-- toda escrita nessa tabela (e a listagem de todos os usuários) passa pela Netlify Function
-- em /api/usuarios,
-- que usa a service role key (ignora RLS). Isso evita expor a lista de usuários/emails
-- pela API pública do Supabase.

-- Depois de rodar este script, crie o primeiro usuário admin em:
-- Authentication > Users > Add user (email + senha)
-- e depois insira o perfil dele manualmente (troque o email abaixo):
-- insert into public.usuarios (id, email, papel)
-- select id, email, 'admin' from auth.users where email = 'seu-email-admin@exemplo.com';
-- Esse será o login usado em /admin/login e em /login no app. A partir daí, novos
-- usuários (admin, professor ou aluno) podem ser cadastrados em /admin/usuarios.
