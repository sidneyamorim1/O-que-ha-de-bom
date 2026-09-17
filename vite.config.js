import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createClient } from '@supabase/supabase-js'

const PAPEIS_VALIDOS = ['admin', 'professor', 'aluno']

// Middleware de dev que espelha a Netlify Function em netlify/functions/usuarios.js,
// pra "npm run dev" funcionar igual à produção sem precisar do netlify-cli.
function usuariosDevMiddleware(env) {
  return {
    name: 'usuarios-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/usuarios', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        function enviar(status, payload) {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }

        const url = env.VITE_SUPABASE_URL
        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !serviceRoleKey) {
          enviar(500, { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no .env' })
          return
        }
        const supabaseAdmin = createClient(url, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })

        const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
        if (!token) {
          enviar(401, { error: 'Não autenticado.' })
          return
        }
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
        if (userError || !userData?.user) {
          enviar(401, { error: 'Sessão inválida.' })
          return
        }
        const { data: perfil, error: perfilError } = await supabaseAdmin
          .from('usuarios')
          .select('papel')
          .eq('id', userData.user.id)
          .maybeSingle()
        if (perfilError) {
          enviar(500, { error: perfilError.message })
          return
        }
        if (perfil?.papel !== 'admin') {
          enviar(403, { error: 'Só administradores podem gerenciar usuários.' })
          return
        }

        let raw = ''
        for await (const chunk of req) raw += chunk

        let body
        try {
          body = JSON.parse(raw || '{}')
        } catch {
          enviar(400, { error: 'JSON inválido' })
          return
        }

        const { action } = body

        if (action === 'listar') {
          const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('id, nome, email, papel, created_at')
            .order('created_at', { ascending: false })
          if (error) return enviar(500, { error: error.message })
          return enviar(200, { usuarios: data })
        }

        if (action === 'criar') {
          const { nome, email, senha, papel } = body
          if (!email || !senha || !papel) return enviar(400, { error: 'Email, senha e papel são obrigatórios.' })
          if (!PAPEIS_VALIDOS.includes(papel)) return enviar(400, { error: 'Papel inválido.' })
          if (senha.length < 6) return enviar(400, { error: 'A senha precisa ter pelo menos 6 caracteres.' })

          const { data: criado, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
          })
          if (createError) return enviar(400, { error: createError.message })

          const { error: insertError } = await supabaseAdmin
            .from('usuarios')
            .insert({ id: criado.user.id, nome: nome?.trim() || null, email, papel })
          if (insertError) {
            await supabaseAdmin.auth.admin.deleteUser(criado.user.id)
            return enviar(500, { error: insertError.message })
          }
          return enviar(200, { ok: true })
        }

        if (action === 'atualizar') {
          const { id, nome, email, senha, papel } = body
          if (!id || !email || !papel) return enviar(400, { error: 'id, email e papel são obrigatórios.' })
          if (!PAPEIS_VALIDOS.includes(papel)) return enviar(400, { error: 'Papel inválido.' })
          if (senha && senha.length < 6) return enviar(400, { error: 'A senha precisa ter pelo menos 6 caracteres.' })

          const dadosAuth = { email }
          if (senha) dadosAuth.password = senha

          const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(id, dadosAuth)
          if (updateAuthError) return enviar(400, { error: updateAuthError.message })

          const { error: updateError } = await supabaseAdmin
            .from('usuarios')
            .update({ nome: nome?.trim() || null, email, papel })
            .eq('id', id)
          if (updateError) return enviar(500, { error: updateError.message })

          return enviar(200, { ok: true })
        }

        if (action === 'excluir') {
          const { id } = body
          if (!id) return enviar(400, { error: 'id é obrigatório.' })
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id)
          if (deleteError) return enviar(500, { error: deleteError.message })
          return enviar(200, { ok: true })
        }

        enviar(400, { error: 'Ação inválida.' })
      })
    },
  }
}

// Middleware de dev que espelha a Netlify Function em netlify/functions/tts.js,
// pra "npm run dev" funcionar igual à produção sem precisar do netlify-cli.
function ttsDevMiddleware(env) {
  return {
    name: 'tts-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const apiKey = env.GOOGLE_TTS_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'GOOGLE_TTS_API_KEY não configurada no .env' }))
          return
        }

        let raw = ''
        for await (const chunk of req) raw += chunk

        let text, voice
        try {
          ;({ text, voice } = JSON.parse(raw || '{}'))
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'JSON inválido' }))
          return
        }

        if (!text || !voice) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Campos "text" e "voice" são obrigatórios' }))
          return
        }

        try {
          const googleRes = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                input: { text },
                voice: { languageCode: 'pt-BR', name: voice },
                audioConfig: { audioEncoding: 'MP3' },
              }),
            }
          )

          const data = await googleRes.json()
          res.statusCode = googleRes.ok ? 200 : googleRes.status
          res.setHeader('Content-Type', 'application/json')
          res.end(
            googleRes.ok && data.audioContent
              ? JSON.stringify({ audioContent: data.audioContent })
              : JSON.stringify({ error: data.error?.message || 'Falha ao gerar áudio' })
          )
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Não foi possível falar com o Google Cloud TTS: ' + err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), ttsDevMiddleware(env), usuariosDevMiddleware(env)],
  }
})
