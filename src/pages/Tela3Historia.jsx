import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { corInfo, labelFaixaEtaria } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import TextToSpeechPlayer from '../components/TextToSpeechPlayer'

export default function Tela3Historia() {
  const navigate = useNavigate()
  const { selectedAge, selectedColor, resetSelecao } = useApp()
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
      .select('id, titulo, texto')
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
    resetSelecao()
    navigate('/')
  }

  const cor = corInfo(selectedColor)

  return (
    <div className="page">
      <div className="card">
        <h1 className="titulo">O que há de BOM?</h1>
        <p className="subtitulo">Cor escolhida</p>
        {cor && <div className="color-swatch color-swatch--display" style={{ backgroundColor: cor.hex }} />}

        {status === 'loading' && <p className="mensagem">Sorteando uma história...</p>}

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
          <>
            {historia.titulo && <h2 className="historia-titulo">{historia.titulo}</h2>}
            <TextToSpeechPlayer texto={historia.texto} />
            <p className="historia-texto">{historia.texto}</p>
          </>
        )}

        <div className="banco-historias">
          <p className="banco-historias__label">Banco de histórias</p>
          <div className="banco-historias__cards">
            <div className="banco-historias__card" />
            <div className="banco-historias__card" />
            <div className="banco-historias__card" />
            <div className="banco-historias__card" />
          </div>
        </div>

        <button type="button" className="btn btn--primary btn--full" onClick={handleJogarNovamente}>
          Jogar novamente
        </button>
      </div>
    </div>
  )
}
