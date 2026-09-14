import { useEffect, useRef, useState } from 'react'

const SUPPORTED = typeof window !== 'undefined' && 'speechSynthesis' in window

function pickVoice() {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang?.toLowerCase() === 'pt-br') ||
    voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) ||
    null
  )
}

export default function TextToSpeechPlayer({ texto }) {
  const [status, setStatus] = useState('idle') // idle | speaking | paused
  const utteranceRef = useRef(null)

  useEffect(() => {
    if (!SUPPORTED) return
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [texto])

  if (!SUPPORTED) {
    return (
      <p className="tts-unsupported">
        Seu navegador não suporta leitura de texto em voz alta. Leia a história abaixo.
      </p>
    )
  }

  function handlePlay() {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'pt-BR'
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => setStatus('idle')
    utterance.onerror = () => setStatus('idle')
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setStatus('speaking')
  }

  function handlePause() {
    window.speechSynthesis.pause()
    setStatus('paused')
  }

  function handleResume() {
    window.speechSynthesis.resume()
    setStatus('speaking')
  }

  function handleStop() {
    window.speechSynthesis.cancel()
    setStatus('idle')
  }

  return (
    <div className="tts-player">
      {status === 'idle' && (
        <button type="button" className="btn btn--primary" onClick={handlePlay}>
          ▶ Ouvir história
        </button>
      )}
      {status === 'speaking' && (
        <div className="tts-controls">
          <button type="button" className="btn" onClick={handlePause}>
            ⏸ Pausar
          </button>
          <button type="button" className="btn" onClick={handleStop}>
            ⏹ Parar
          </button>
        </div>
      )}
      {status === 'paused' && (
        <div className="tts-controls">
          <button type="button" className="btn btn--primary" onClick={handleResume}>
            ▶ Continuar
          </button>
          <button type="button" className="btn" onClick={handleStop}>
            ⏹ Parar
          </button>
        </div>
      )}
    </div>
  )
}
