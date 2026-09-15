import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { corInfo, labelFaixaEtaria } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import TextToSpeechPlayer from '../components/TextToSpeechPlayer'
import AudioPlayer from '../components/AudioPlayer'

export default function Tela3Historia() {
  const navigate = useNavigate()
  const { selectedAge, selectedColor } = useApp()
  const [status, setStatus] = useState('loading') // loading | ok | empty | error
  const [historia, setHistoria] = useState(null)

  useEffect(() => {
    if (!selectedAge || !selectedColor) {
      navigate('/', { replace: true })
      return
    }

    let active = true
    setStatus('loading')

    supabase
      .from('historias')
      .select('id, titulo, texto, audio_url, imagem_url')
      .eq('faixa_etaria', selectedAge)
      .eq('cor', selectedColor)
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error(error)
          setStatus('error')
          return
        }
        if (!data || data.length === 0) {
          setStatus('empty')
          return
        }
        const sorteada = data[Math.floor(Math.random() * data.length)]
        setHistoria(sorteada)
        setStatus('ok')
      })

    return () => {
      active = false
    }
  }, [selectedAge, selectedColor, navigate])

  function handleJogarNovamente() {
    navigate('/roleta')
  }

  const cor = corInfo(selectedColor)

  return (
    <div className="page">
      <div className="card card--compacto">
        {status === 'loading' && <p className="mensagem">✨ Sorteando uma história...</p>}

        {status === 'error' && (
          <p className="mensagem mensagem--erro">
            Não foi possível buscar a história agora. Verifique sua conexão e tente novamente.
          </p>
        )}

        {status === 'empty' && (
          <p className="mensagem">
            Ainda não há histórias cadastradas para {labelFaixaEtaria(selectedAge)} anos na cor {cor?.label}.
          </p>
        )}

        {status === 'ok' && historia && (
          <div className="historia-reveal">
            {historia.titulo && <h2 className="historia-titulo">{historia.titulo}</h2>}
            {historia.imagem_url ? (
              <div className="historia-imagem-wrap">
                <img src={historia.imagem_url} alt={historia.titulo || 'Ilustração da história'} className="historia-imagem" />
                {cor && (
                  <span className="cor-chip cor-chip--sobreposto">
                    <span className="cor-chip__ponto" style={{ backgroundColor: cor.hex }} />
                    Cor: {cor.label}
                  </span>
                )}
              </div>
            ) : (
              cor && (
                <span className="cor-chip">
                  <span className="cor-chip__ponto" style={{ backgroundColor: cor.hex }} />
                  Cor: {cor.label}
                </span>
              )
            )}
            {historia.audio_url ? (
              <AudioPlayer src={historia.audio_url} />
            ) : (
              <TextToSpeechPlayer texto={historia.texto} />
            )}
            <p className="historia-texto">{historia.texto}</p>
          </div>
        )}

        <button type="button" className="btn btn--primary btn--full" onClick={handleJogarNovamente}>
          🎲 Jogar novamente
        </button>
      </div>
    </div>
  )
}
