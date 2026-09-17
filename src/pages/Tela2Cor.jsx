import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORES, labelFaixaEtaria } from '../constants/gameData'
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
    <div className="page page--single-screen">
      <div className="card card--roleta">
        <div className="game-card-topbar">
          <span className="game-card-tag">
            🧒 Faixa selecionada: <strong>{labelFaixaEtaria(selectedAge)} anos</strong>
          </span>
          <button type="button" className="game-card-link" onClick={() => navigate('/')}>
            Trocar idade
          </button>
        </div>

        <div className="titulo-wrapper titulo-wrapper--compacto">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo titulo-logo--otimizado" />
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Gire a roleta e escolha a cor sorteada:</p>

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
          ← Voltar para seleção de idade
        </button>
      </div>
    </div>
  )
}
