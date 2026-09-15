export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GOOGLE_TTS_API_KEY não configurada' }) }
  }

  let text, voice
  try {
    ;({ text, voice } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) }
  }

  if (!text || !voice) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campos "text" e "voice" são obrigatórios' }) }
  }
  if (text.length > 4500) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Texto muito longo (limite de 4500 caracteres por chamada)' }) }
  }

  const googleRes = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'pt-BR', name: voice },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  })

  const data = await googleRes.json()

  if (!googleRes.ok || !data.audioContent) {
    return {
      statusCode: googleRes.status || 500,
      body: JSON.stringify({ error: data.error?.message || 'Falha ao gerar áudio' }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioContent: data.audioContent }),
  }
}
