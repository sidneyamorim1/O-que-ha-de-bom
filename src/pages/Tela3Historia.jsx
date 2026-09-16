import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { carregarHistorias, consultarHistorias } from '../lib/historias'
import { corInfo, labelFaixaEtaria } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import TextToSpeechPlayer from '../components/TextToSpeechPlayer'
import AudioPlayer from '../components/AudioPlayer'

export default function Tela3Historia() {
  const navigate = useNavigate()
  const { selectedAge, selectedColor } = useApp()

  useEffect(() => {
    if (!selectedAge || !selectedColor) {
      navigate('/', { replace: true })
    }
  }, [selectedAge, selectedColor, navigate])

  if (!selectedAge || !selectedColor) return null

  return <Historia key={`${selectedAge}:${selectedColor}`} selectedAge={selectedAge} selectedColor={selectedColor} />
}

function sortear(historias) {
  if (!historias.length) return { status: 'empty', historia: null }
  return { status: 'ok', historia: historias[Math.floor(Math.random() * historias.length)] }
}

function Historia({ selectedAge, selectedColor }) {
  const navigate = useNavigate()
  const [{ status, historia }, setResultado] = useState(() => {
    const historias = consultarHistorias(selectedAge, selectedColor)
    return historias ? sortear(historias) : { status: 'loading', historia: null }
  })

  useEffect(() => {
    if (status !== 'loading') return

    let active = true
    carregarHistorias(selectedAge, selectedColor)
      .then((historias) => {
        if (active) setResultado(sortear(historias))
      })
      .catch((error) => {
        if (!active) return
        console.error(error)
        setResultado({ status: 'error', historia: null })
      })

    return () => {
      active = false
    }
  }, [selectedAge, selectedColor, status])

  function handleJogarNovamente() {
    navigate('/roleta')
  }

  const cor = corInfo(selectedColor)

  return (
    <div className="page page--historia">
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
