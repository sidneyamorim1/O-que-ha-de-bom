import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORES } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import ColorSwatchButton from '../components/ColorSwatchButton'
import { anteciparHistorias } from '../lib/historias'
import logo from '../assets/logo/logo.webp'

export default function Tela2Cor() {
  const navigate = useNavigate()
  const { selectedAge, selectedColor, setSelectedColor } = useApp()

  useEffect(() => {
    if (!selectedAge) navigate('/', { replace: true })
    else anteciparHistorias(selectedAge)
  }, [selectedAge, navigate])

  useEffect(() => {
    setSelectedColor(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelect(cor) {
    setSelectedColor(cor.value)
    navigate('/historia')
  }

  if (!selectedAge) return null

  return (
    <div className="page">
      <div className="card">
        <div className="titulo-wrapper">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo" />
          <h1 className="titulo">
            O que há de
            <br />
            BOM?
          </h1>
        </div>
        <p className="subtitulo">Qual cor saiu na roleta?</p>
        <div className="grid-cores">
          {CORES.map((cor) => (
            <ColorSwatchButton
              key={cor.value}
              cor={cor}
              selected={selectedColor === cor.value}
              onClick={() => handleSelect(cor)}
            />
          ))}
        </div>
        <button type="button" className="btn-voltar" onClick={() => navigate('/')}>
          ← Trocar idade
        </button>
      </div>
    </div>
  )
}
