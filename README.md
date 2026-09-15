# O que há de Bom

App complementar de um jogo de tabuleiro físico. O jogador escolhe a idade, informa a cor que saiu na roleta física do tabuleiro, e o app sorteia uma história cadastrada para aquela combinação de idade + cor — lida em voz alta pelo navegador ou, se houver, tocando um MP3 gravado.

## Status atual (15/09/2026)

- **App em produção:** https://oquehadebom.netlify.app/
- **Repositório:** `git@github.com:sidneyamorim1/O-que-ha-de-bom.git` (branch `main`, conectado ao Netlify — todo push faz deploy automático)
- **Supabase:** projeto `https://nswhggxoqrnknzjkggqv.supabase.co`, schema já aplicado (tabela `historias` + buckets `audios` e `imagens`)
- **Histórias cadastradas:** só a faixa **10-16** está completa (11 histórias, todas as 6 cores, cada uma com imagem ilustrativa gerada em SVG). As faixas 17-20, 21-30, 31-40, 41-50 e 51-60 ainda estão **vazias**.
- **Usuário admin:** já criado no Supabase Auth (email/senha só o usuário sabe, não fica em nenhum arquivo do projeto).
- **Narração por IA (Google Cloud TTS, voz Chirp3-HD):** funcionalidade completa no admin —
  - Testador de vozes (30 vozes pt-BR) no topo do `/admin`, com play automático ao trocar.
  - Voz configurável em dois níveis, salvos no `localStorage` do navegador (por isso é por computador/navegador, não fica no banco): um **padrão geral** e, opcionalmente, uma **voz específica por faixa etária** que sobrescreve o padrão só naquela faixa.
  - Botão **"Gerar narração com IA"** em cada história (usa a voz da faixa dela) — só fica valendo depois de clicar em "Salvar".
  - Botão **"Aplicar em lote"** — gera e substitui de uma vez o áudio de todas as histórias de uma faixa (ou de todas as faixas sem voz específica, no escopo "padrão geral"). Repetível a qualquer momento.
  - Projeto do Google Cloud usado: `spatial-tempo-415713` (org `genianti.org`, conta "OasisBR") — Cloud Text-to-Speech API ativada lá, chave de API restrita só a essa API.
  - Roda via Netlify Function (`netlify/functions/tts.js`, endpoint `/api/tts`) — chave `GOOGLE_TTS_API_KEY` nunca vai pro navegador. Em dev local, um middleware equivalente em `vite.config.js` cobre o mesmo endpoint.
  - Custo: voz Chirp3-HD tem 1 milhão de caracteres grátis por mês; no volume atual de histórias, uso normal não deve ultrapassar isso (ver conversa/commits pra detalhes de cálculo).
- **Pendências conhecidas:** cadastrar histórias das faixas etárias restantes (17-20 até 51-60) — ver seção "Cadastrando histórias em lote" abaixo pro formato que o Claude consegue processar direto; decidir se a voz padrão/por faixa configurada agora deve ser fixada em algum lugar compartilhado (hoje é só local no navegador de quem configura, então cada computador que acessar o admin pode ter uma preferência diferente até configurar de novo).

### Cadastrando histórias em lote (com ajuda do Claude)

Pra pedir pro Claude cadastrar várias histórias novas de uma vez (com áudio e/ou imagem), o formato mais fácil é uma pasta local com uma planilha/CSV (colunas: `faixa_etaria`, `cor`, `titulo`, `texto`, `audio_arquivo`, `imagem_arquivo`) mais os arquivos de mídia referenciados nela. Detalhes de exemplo na conversa do dia 15/09/2026 com o Claude Code — ou só pergunte de novo, ele reexplica.

### Continuando em outro computador

```bash
git clone git@github.com:sidneyamorim1/O-que-ha-de-bom.git
cd O-que-ha-de-bom
npm install
cp .env.example .env
```

Preencha o `.env` com:
```
VITE_SUPABASE_URL=https://nswhggxoqrnknzjkggqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zd2hnZ3hvcXJua256amtnZ3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTEyNzksImV4cCI6MjEwNDk4NzI3OX0.QTn5AT4yHz5Og3oGuFxaMHeYMC8318re4Sd7UO7P2Us
GOOGLE_TTS_API_KEY=<peça a chave para quem já tem o projeto Google Cloud — não está neste arquivo por segurança>
```
(a `VITE_SUPABASE_ANON_KEY` é a chave pública "anon" do projeto — segura de expor, protegida pelas políticas de RLS do banco. Já a `GOOGLE_TTS_API_KEY` é secreta de verdade — nunca vai pro navegador, é usada só pela Netlify Function/middleware de dev).

Depois: `npm run dev`.

**Atenção ao clonar via SSH:** se esse computador novo não tiver a chave SSH da conta `sidneyamorim1` cadastrada no GitHub, o `git clone` acima vai falhar. Nesse caso use a URL HTTPS (`https://github.com/sidneyamorim1/O-que-ha-de-bom.git`) e autentique com usuário/token do GitHub, ou cadastre a chave SSH dessa máquina na conta primeiro.

O Netlify já está configurado (env vars + deploy automático) — não precisa mexer em nada lá pra continuar o desenvolvimento, só dar `git push` que ele republica sozinho.

## Stack

- React + Vite
- Supabase (Postgres + Auth + Storage)
- Leitura em voz alta via Web Speech API do navegador, com opção de subir um MP3 gravado (toca no lugar da leitura por voz quando presente) ou uma imagem ilustrativa
- Google Cloud Text-to-Speech (vozes Chirp3-HD) — testador de vozes, geração de narração por história e aplicação em lote por faixa etária, tudo no admin, via Netlify Function (`netlify/functions/tts.js`)
- Hospedagem: Netlify

## Rodando localmente

```bash
npm install
cp .env.example .env
# edite .env com a URL e a anon key do seu projeto Supabase
npm run dev
```

## Configurando o Supabase (num projeto novo, do zero)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql). Isso cria a tabela `historias`, os buckets de Storage `audios` e `imagens`, e as políticas de acesso (leitura pública, escrita só para usuários autenticados).
3. Vá em **Authentication > Users > Add user** e crie o usuário administrador (email + senha) — é o login usado em `/admin/login`.
4. Em **Project Settings > API**, copie a **Project URL** e a **anon public key** para o seu `.env` (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

## Cadastrando histórias

Acesse `/admin/login`, entre com o usuário criado no Supabase, e cadastre histórias em `/admin`: escolha a faixa etária, a cor, um título opcional, o texto e, se quiser, um MP3 gravado (manual ou gerado pelo botão "Gerar narração com IA") e/ou uma imagem ilustrativa. Cada combinação de idade + cor pode ter várias histórias — uma é sorteada aleatoriamente a cada jogada. Quando não há áudio, o texto é lido em voz alta pelo navegador. O testador de vozes no topo do admin também permite aplicar uma voz a todas as histórias de uma faixa de uma vez (veja a seção "Narração por IA" acima).

## Deploy no Netlify

1. Conecte este repositório no Netlify (o `netlify.toml` já define build command `npm run build`, publish dir `dist`, o diretório de functions e o redirect `/api/tts`).
2. Em **Site settings > Environment variables**, adicione `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `GOOGLE_TTS_API_KEY` com os mesmos valores do seu `.env`. **Atenção ao nome exato** — as duas primeiras precisam começar com `VITE_` (sem isso o Vite não expõe a variável pro navegador e o app quebra com "supabaseUrl is required"); a `GOOGLE_TTS_API_KEY` **não** deve ter esse prefixo (é secreta, só o servidor/function usa).
3. Faça o deploy. Se mudar env vars depois de já ter feito deploy, use **Trigger deploy > Clear cache and deploy site** pra garantir que o novo build pegue os valores.

## Fluxo do app

1. `/` — seleção de idade (6 faixas fixas).
2. `/roleta` — seleção da cor sorteada na roleta física. A idade fica fixa aqui; só muda se o jogador clicar em "← Trocar idade".
3. `/historia` — sorteio de uma história cadastrada para aquela idade + cor. Botão "Jogar novamente" volta pra `/roleta` mantendo a idade.
4. `/admin` (protegido por login) — CRUD de histórias, com upload opcional de MP3 e imagem, e um testador de vozes de IA (Google Cloud TTS).
