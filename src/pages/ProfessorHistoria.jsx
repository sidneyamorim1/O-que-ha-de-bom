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

  useEffect(() => {
    let active = true
    supabase
      .from('historias_professores')
      .select('*')
      .eq('faixa', faixa)
      .eq('cor', cor)
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error(error)
          setResultado({ status: 'error', historia: null })
          return
        }
        setResultado(sortear(data ?? []))
      })

    return () => {
      active = false
    }
  }, [faixa, cor])

  function handleJogarNovamente() {
    navigate(`/professores/${faixa}/cor`)
  }

  const corInfoAtual = corInfo(cor)

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
            Ainda não há histórias cadastradas para {labelFaixaProfessor(faixa)} na cor {corInfoAtual?.label}.
          </p>
        )}

        {status === 'ok' && historia && (
          <div className="historia-reveal">
            {historia.titulo && <h2 className="historia-titulo">{historia.titulo}</h2>}
            {historia.imagem_url ? (
              <div className="historia-imagem-wrap">
                <img
                  src={historia.imagem_url}
                  alt={historia.titulo || 'Ilustração da história'}
                  className="historia-imagem"
                />
                {corInfoAtual && (
                  <span className="cor-chip cor-chip--sobreposto">
                    <span className="cor-chip__ponto" style={{ backgroundColor: corInfoAtual.hex }} />
                    Cor: {corInfoAtual.label}
                  </span>
                )}
              </div>
            ) : (
              corInfoAtual && (
                <span className="cor-chip">
                  <span className="cor-chip__ponto" style={{ backgroundColor: corInfoAtual.hex }} />
                  Cor: {corInfoAtual.label}
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
