import { useRef, useState } from 'react'
import { VOZES_TTS, GENEROS_NARRADOR, getVozPreferida, setVozPreferida } from '../constants/gameData'

const TEXTO_PADRAO =
  'Eu sou o Cauã. Na aldeia dos meus avós, as vozes dos mais velhos são mais claras que qualquer sinal de Wi-Fi.'

function base64ParaBlobUrl(base64) {
  const bytes = atob(base64)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  const blob = new Blob([array], { type: 'audio/mpeg' })
  return URL.createObjectURL(blob)
}

// Escolhe e testa as duas vozes padrão do app (feminina e masculina) — compartilhadas entre
// histórias de alunos e de professores. Não mexe em nenhuma história já cadastrada; isso é
// feito à parte, em "Aplicar em massa".
export default function VoiceTester() {
  const [vozFeminina, setVozFeminina] = useState(() => getVozPreferida('feminino'))
  const [vozMasculina, setVozMasculina] = useState(() => getVozPreferida('masculino'))
  const [texto, setTexto] = useState(TEXTO_PADRAO)
  const [testandoGenero, setTestandoGenero] = useState(null)
  const [erro, setErro] = useState(null)
  const audioRefFeminino = useRef(null)
  const audioRefMasculino = useRef(null)
  const blobUrlFeminino = useRef(null)
  const blobUrlMasculino = useRef(null)

  function refsDoGenero(genero) {
    return genero === 'masculino'
      ? { audioRef: audioRefMasculino, blobRef: blobUrlMasculino }
      : { audioRef: audioRefFeminino, blobRef: blobUrlFeminino }
  }

  async function testar(genero, vozEscolhida) {
    if (!texto.trim()) return
    setTestandoGenero(genero)
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

      const { audioRef, blobRef } = refsDoGenero(genero)
      if (blobRef.current) URL.revokeObjectURL(blobRef.current)
      const url = base64ParaBlobUrl(data.audioContent)
      blobRef.current = url

      if (audioRef.current) {
        audioRef.current.src = url
        await audioRef.current.play()
      }
    } catch (err) {
      setErro(err.message)
    } finally {
      setTestandoGenero(null)
    }
  }

  function handleVozChange(genero, novaVoz) {
    if (genero === 'masculino') setVozMasculina(novaVoz)
    else setVozFeminina(novaVoz)
    setVozPreferida(novaVoz, genero)
    testar(genero, novaVoz)
  }

  return (
    <div className="voice-tester">
      <h2 className="form-titulo">Vozes padrão (Google Cloud TTS)</h2>
      <p className="form-hint">
        Uma voz pra narrador feminino e outra pra masculino — usadas em todas as histórias (alunos e
        professores) marcadas com aquele gênero, e sugeridas automaticamente ao cadastrar uma nova.
      </p>

      <label className="form-field form-field--full">
        Texto de teste
        <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={2} />
      </label>

      {erro && <p className="mensagem mensagem--erro">{erro}</p>}

      {GENEROS_NARRADOR.map((g) => {
        const voz = g.value === 'masculino' ? vozMasculina : vozFeminina
        const audioRef = g.value === 'masculino' ? audioRefMasculino : audioRefFeminino
        return (
          <div key={g.value} className="voice-tester__genero">
            <label className="form-field form-field--full">
              Voz {g.value === 'masculino' ? 'masculina' : 'feminina'} padrão
              <select value={voz} onChange={(e) => handleVozChange(g.value, e.target.value)}>
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
                className="btn"
                onClick={() => testar(g.value, voz)}
                disabled={testandoGenero === g.value}
              >
                {testandoGenero === g.value ? 'Gerando...' : '▶ Testar'}
              </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={audioRef} controls className="audio-player voice-tester__player" />
          </div>
        )
      })}
    </div>
  )
}
