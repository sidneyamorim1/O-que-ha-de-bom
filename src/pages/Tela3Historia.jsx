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

  return (
    <Historia
      key={`${selectedAge}:${selectedColor}`}
      selectedAge={selectedAge}
      selectedColor={selectedColor}
    />
  )
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

  function handleSortearOutra() {
    setResultado({ status: 'loading', historia: null })
    carregarHistorias(selectedAge, selectedColor)
      .then((historias) => {
        setResultado(sortear(historias))
      })
      .catch((error) => {
        console.error(error)
        setResultado({ status: 'error', historia: null })
      })
  }

  const cor = corInfo(selectedColor)

  return (
    <div className="page page--historia">
      <div className="card card--historia-card" style={{ '--cor-tema': cor?.hex || '#f7c948' }}>
        {/* Cabeçalho da carta do jogo com metadados */}
        <div className="historia-top-bar historia-top-bar--fim">
          {cor && (
            <span className="historia-badge historia-badge--cor">
              <span className="cor-ponto" style={{ backgroundColor: cor.hex }} />
              Cor: {cor.label}
            </span>
          )}
        </div>

        {status === 'loading' && (
          <div className="historia-loading-box">
            <div className="spinner" />
            <p className="mensagem">✨ Sorteando uma história mágica...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="admin-alert admin-alert--erro" style={{ margin: '20px 0' }}>
            <span>⚠️</span>
            <p>Não foi possível buscar a história agora. Verifique sua conexão e tente novamente.</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="historia-empty-box">
            <span style={{ fontSize: 36 }}>📭</span>
            <p className="mensagem">
              Ainda não há histórias cadastradas para <strong>{labelFaixaEtaria(selectedAge)} anos</strong> na cor{' '}
              <strong>{cor?.label}</strong>.
            </p>
          </div>
        )}

        {status === 'ok' && historia && (
          <div className="historia-reveal">
            {historia.titulo && <h2 className="historia-titulo">{historia.titulo}</h2>}

            {historia.imagem_url && (
              <div className="historia-imagem-wrap">
                <img
                  src={historia.imagem_url}
                  alt={historia.titulo || 'Ilustração da história'}
                  className="historia-imagem"
                />
              </div>
            )}

            {/* Reprodutor de áudio lúdico ou leitor TTS */}
            <div className="historia-audio-wrapper">
              {historia.audio_url ? (
                <AudioPlayer src={historia.audio_url} />
              ) : (
                <TextToSpeechPlayer texto={historia.texto} />
              )}
            </div>

            {/* Texto da história com tipografia expandida e legível */}
            <div className="historia-texto-box">
              <span className="historia-aspas historia-aspas--abre">“</span>
              <p className="historia-texto">{historia.texto}</p>
              <span className="historia-aspas historia-aspas--fecha">”</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="historia-acoes-rodape">
          <button
            type="button"
            className="btn btn--primary btn--full btn--brilho"
            onClick={handleJogarNovamente}
          >
            🎲 Girar a roleta novamente
          </button>
          <button
            type="button"
            className="btn btn--secundario btn--full"
            onClick={handleSortearOutra}
            disabled={status === 'loading'}
          >
            🔄 Outra história desta cor
          </button>
        </div>
      </div>
    </div>
  )
}
