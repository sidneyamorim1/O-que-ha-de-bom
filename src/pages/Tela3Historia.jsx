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
      <div className="card">
        <div className="titulo-wrapper">
          <span className="titulo-emoji">📖</span>
          <h1 className="titulo">
            O que há de
            <br />
            BOM?
          </h1>
        </div>
        <p className="subtitulo">Cor escolhida</p>

        {cor && (
          <div className="color-swatch color-swatch--display">
            <span className="color-swatch__circle" style={{ backgroundColor: cor.hex }} />
            <span className="color-swatch__label">{cor.label}</span>
          </div>
        )}

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
            {historia.imagem_url && (
              <img src={historia.imagem_url} alt={historia.titulo || 'Ilustração da história'} className="historia-imagem" />
            )}
            {historia.audio_url ? (
              <AudioPlayer src={historia.audio_url} />
            ) : (
              <TextToSpeechPlayer texto={historia.texto} />
            )}
            <div className="historia-aspas">"</div>
            <p className="historia-texto">{historia.texto}</p>
            <div className="historia-aspas historia-aspas--fim">"</div>
          </div>
        )}

        <button type="button" className="btn btn--primary btn--full" onClick={handleJogarNovamente}>
          🎲 Jogar novamente
        </button>
      </div>
    </div>
  )
}
