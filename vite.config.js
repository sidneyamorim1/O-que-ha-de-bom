import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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
    plugins: [react(), ttsDevMiddleware(env)],
  }
})
