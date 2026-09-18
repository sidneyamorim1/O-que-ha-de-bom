import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { CORES, FAIXAS_PROFESSOR, corInfo, labelFaixaProfessor } from '../constants/gameData'
import TextToSpeechPlayer from '../components/TextToSpeechPlayer'
import AudioPlayer from '../components/AudioPlayer'

function sortear(historias) {
  if (!historias.length) return { status: 'empty', historia: null }
  return { status: 'ok', historia: historias[Math.floor(Math.random() * historias.length)] }
}

export default function ProfessorHistoria() {
  const navigate = useNavigate()
  const { faixa, cor } = useParams()
  const faixaValida = FAIXAS_PROFESSOR.some((f) => f.value === faixa)
  const corValida = CORES.some((c) => c.value === cor)

  useEffect(() => {
    if (!faixaValida || !corValida) navigate('/escolha/professores', { replace: true })
  }, [faixaValida, corValida, navigate])

  if (!faixaValida || !corValida) return null

  return <Historia key={`${faixa}:${cor}`} faixa={faixa} cor={cor} />
}

function Historia({ faixa, cor }) {
  const navigate = useNavigate()
  const [{ status, historia }, setResultado] = useState({ status: 'loading', historia: null })

  function buscar() {
    supabase
      .from('historias_professores')
      .select('*')
      .eq('faixa', faixa)
      .eq('cor', cor)
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
          setResultado({ status: 'error', historia: null })
          return
        }
        setResultado(sortear(data ?? []))
      })
  }

  useEffect(() => {
    buscar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faixa, cor])

  function handleJogarNovamente() {
    navigate(`/professores/${faixa}/cor`)
  }

  const corInfoAtual = corInfo(cor)

  return (
    <div className="page page--single-screen page--historia">
      <div className="card card--historia-card" style={{ '--cor-tema': corInfoAtual?.hex || '#f7c948' }}>
        <div className="historia-top-bar">
          {corInfoAtual && (
            <span className="historia-badge historia-badge--cor">
              <span className="cor-ponto" style={{ backgroundColor: corInfoAtual.hex }} />
              Cor: {corInfoAtual.label}
            </span>
          )}
        </div>

        {status === 'loading' && (
          <div className="historia-loading-box">
            <div className="spinner" />
            <p className="mensagem">✨ Selecionando reflexão pedagógica...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="admin-alert admin-alert--erro" style={{ margin: '20px 0' }}>
            <span>⚠️</span>
            <p>Não foi possível carregar o conteúdo. Verifique sua conexão e tente novamente.</p>
          </div>
        )}

        {status === 'empty' && (
          <div className="historia-empty-box">
            <span style={{ fontSize: 36 }}>📭</span>
            <p className="mensagem">
              Ainda não há histórias cadastradas para <strong>Faixa {labelFaixaProfessor(faixa)}</strong> na cor{' '}
              <strong>{corInfoAtual?.label}</strong>.
            </p>
          </div>
        )}

        {status === 'ok' && historia && (
          <div className="historia-grid">
            <div className="historia-col historia-col--media">
              {historia.imagem_url && (
                <div className="historia-imagem-wrap">
                  <img
                    src={historia.imagem_url}
                    alt={historia.titulo || 'Ilustração'}
                    className="historia-imagem"
                  />
                </div>
              )}

              <div className="historia-audio-wrapper">
                {historia.audio_url ? (
                  <AudioPlayer src={historia.audio_url} />
                ) : (
                  <TextToSpeechPlayer texto={historia.texto} />
                )}
              </div>
            </div>

            <div className="historia-col historia-col--texto">
              {historia.titulo && <h2 className="historia-titulo">{historia.titulo}</h2>}
              <div className="historia-texto-box">
                <span className="historia-aspas historia-aspas--abre">“</span>
                <p className="historia-texto">{historia.texto}</p>
                <span className="historia-aspas historia-aspas--fecha">”</span>
              </div>
            </div>
          </div>
        )}

        <div className="historia-acoes-rodape">
          <button
            type="button"
            className="btn btn--primary btn--full btn--brilho"
            onClick={handleJogarNovamente}
          >
            🎲 Girar a roleta novamente
          </button>
        </div>
      </div>
    </div>
  )
}
