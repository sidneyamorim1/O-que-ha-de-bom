# O que há de Bom

App complementar de um jogo de tabuleiro físico. O jogador escolhe a idade, informa a cor que saiu na roleta física do tabuleiro, e o app sorteia uma história cadastrada para aquela combinação de idade + cor — lida em voz alta pelo navegador ou, se houver, tocando um MP3 gravado (gerado manualmente ou por narração de IA).

**Em produção:** https://oquehadebom.netlify.app/

<details>
<summary>Detalhes técnicos (stack, setup, deploy)</summary>

## Stack

- React + Vite
- Supabase (Postgres + Auth + Storage)
- Leitura em voz alta via Web Speech API do navegador, com opção de MP3 gravado ou gerado por IA e imagem ilustrativa
- Google Cloud Text-to-Speech (vozes Chirp3-HD) — testador de vozes, geração de narração por história e aplicação em lote por faixa etária, no admin, via Netlify Function (`netlify/functions/tts.js`)
- Hospedagem: Netlify (deploy automático a cada push na `main`)

## Rodando localmente

```bash
git clone git@github.com:sidneyamorim1/O-que-ha-de-bom.git
cd O-que-ha-de-bom
npm install
cp .env.example .env
# edite o .env com as credenciais do seu projeto Supabase e do Google Cloud TTS
npm run dev
```

Se o clone via SSH falhar (chave não cadastrada nesta máquina), use a URL HTTPS: `https://github.com/sidneyamorim1/O-que-ha-de-bom.git`.

## Configurando o Supabase (num projeto novo, do zero)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria a tabela `historias`, os buckets de Storage `audios` e `imagens`, e as políticas de acesso (leitura pública, escrita só para usuários autenticados).
3. Vá em **Authentication > Users > Add user** e crie o usuário administrador (email + senha) — é o login usado em `/admin/login`.
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key** para o seu `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

## Cadastrando histórias

Acesse `/admin/login`, entre com o usuário criado no Supabase, e cadastre histórias em `/admin`: escolha a faixa etária, a cor, um título opcional, o texto e, se quiser, um MP3 gravado (manual ou gerado pelo botão "Gerar narração com IA") e/ou uma imagem ilustrativa. Cada combinação de idade + cor pode ter várias histórias — uma é sorteada aleatoriamente a cada jogada. Quando não há áudio, o texto é lido em voz alta pelo navegador.

A voz de narração por IA é configurável no topo do `/admin` (padrão geral, ou específica por faixa etária) e o botão "Aplicar em lote" gera de uma vez o áudio de todas as histórias de uma faixa.

## Deploy no Netlify

1. Conecte este repositório no Netlify (o `netlify.toml` já define build command `npm run build`, publish dir `dist`, o diretório de functions e o redirect `/api/tts`).
2. Em **Site settings > Environment variables**, adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `GOOGLE_TTS_API_KEY` com os mesmos valores do seu `.env`. As duas primeiras precisam começar com `VITE_` (senão o Vite não expõe a variável pro navegador); a `GOOGLE_TTS_API_KEY` não deve ter esse prefixo (é secreta, só o servidor/function usa).
3. Faça o deploy. Se mudar env vars depois de já ter feito deploy, use **Trigger deploy > Clear cache and deploy site**.

## Fluxo do app

1. `/` — seleção de idade (6 faixas fixas).
2. `/roleta` — seleção da cor sorteada na roleta física. A idade fica fixa aqui; só muda se o jogador clicar em "← Trocar idade".
3. `/historia` — sorteio de uma história cadastrada para aquela idade + cor. Botão "Jogar novamente" volta pra `/roleta` mantendo a idade.
4. `/admin` (protegido por login) — CRUD de histórias, com upload opcional de MP3 e imagem, e um testador de vozes de IA (Google Cloud TTS).

</details>
