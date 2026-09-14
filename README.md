# O que há de Bom

App complementar de um jogo de tabuleiro físico. O jogador escolhe a idade, informa a cor que saiu na roleta física do tabuleiro, e o app sorteia e lê em voz alta uma história cadastrada para aquela combinação de idade + cor.

## Stack

- React + Vite
- Supabase (Postgres + Auth) — sem Storage, as histórias são só texto
- Leitura em voz alta via Web Speech API do navegador (sem áudio gravado)
- Hospedagem: Netlify

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite .env com a URL e a anon key do seu projeto Supabase
npm run dev
```

## Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria a tabela `historias` e as políticas de acesso (leitura pública, escrita só para usuários autenticados).
3. Vá em **Authentication > Users > Add user** e crie o usuário administrador (email + senha) — é o login usado em `/admin/login`.
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key** para o seu `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

## Cadastrando histórias

Acesse `/admin/login`, entre com o usuário criado no Supabase, e cadastre histórias em `/admin`: escolha a faixa etária, a cor, um título opcional e o texto. Cada combinação de idade + cor pode ter várias histórias — uma é sorteada aleatoriamente a cada jogada.

## Deploy no Netlify

1. Conecte este repositório no Netlify (o `netlify.toml` já define build command `npm run build` e publish dir `dist`, com redirect de SPA).
2. Em **Site settings > Environment variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` com os mesmos valores do seu `.env`.
3. Faça o deploy.

## Fluxo do app

1. `/` — seleção de idade (6 faixas fixas).
2. `/roleta` — seleção da cor sorteada na roleta física.
3. `/historia` — sorteio de uma história cadastrada para aquela idade + cor, com botão para ouvir em voz alta.
4. `/admin` (protegido por login) — CRUD de histórias.
