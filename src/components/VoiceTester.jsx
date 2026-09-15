import { useRef, useState } from 'react'
import { VOZES_TTS } from '../constants/gameData'

const TEXTO_PADRAO =
  'Eu sou o Cauã. Na aldeia dos meus avós, as vozes dos mais velhos são mais claras que qualquer sinal de Wi-Fi.'

function base64ParaBlobUrl(base64) {
  const bytes = atob(base64)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  const blob = new Blob([array], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

export default function VoiceTester() {
  const [voz, setVoz] = useState(VOZES_TTS[0].name)
  const [texto, setTexto] = useState(TEXTO_PADRAO)
  const [status, setStatus] = useState('idle') // idle | loading | ok | error
  const [erro, setErro] = useState(null)
  const audioRef = useRef(null)
  const ultimoBlobUrl = useRef(null)

  async function testar(vozEscolhida) {
    if (!texto.trim()) return
    setStatus('loading')
    setErro(null)

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: texto, voice: vozEscolhida }),
      })
      const data = await res.json()

      if (!res.ok || !data.audioContent) {
        throw new Error(data.error || 'Falha ao gerar áudio')
      }

      if (ultimoBlobUrl.current) URL.revokeObjectURL(ultimoBlobUrl.current)
      const url = base64ParaBlobUrl(data.audioContent)
      ultimoBlobUrl.current = url

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
      setStatus('ok')
    } catch (err) {
      setErro(err.message)
      setStatus('error')
    }
  }

  function handleVozChange(e) {
    const novaVoz = e.target.value
    setVoz(novaVoz)
    testar(novaVoz)
  }

  return (
    <div className="voice-tester">
      <h2 className="form-titulo">Testar vozes (Google Cloud TTS)</h2>
      <p className="form-hint">
        Escolha uma voz pra ouvir — troca automaticamente ao selecionar. Isso é só um teste, não afeta as
        histórias cadastradas.
      </p>

      <label className="form-field form-field--full">
        Texto de teste
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={3} />
      </label>

      <label className="form-field form-field--full">
        Voz
        <select value={voz} onChange={handleVozChange}>
          {VOZES_TTS.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name.replace('pt-BR-Chirp3-HD-', '')} — {v.genero}
            </option>
          ))}
        </select>
      </label>

      <div className="voice-tester__acoes">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => testar(voz)}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Gerando...' : '▶ Testar de novo'}
        </button>
        {status === 'error' && <span className="mensagem mensagem--erro">{erro}</span>}
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} controls className="audio-player voice-tester__player" />
    </div>
  )
}
