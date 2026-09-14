import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CORES } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import ColorSwatchButton from '../components/ColorSwatchButton'

export default function Tela2Cor() {
  const navigate = useNavigate()
  const { selectedAge, selectedColor, setSelectedColor } = useApp()

  useEffect(() => {
    if (!selectedAge) navigate('/', { replace: true })
  }, [selectedAge, navigate])

  function handleSelect(cor) {
    setSelectedColor(cor.value)
    navigate('/historia')
  }

  if (!selectedAge) return null

  return (
    <div className="page">
      <div className="card">
        <h1 className="titulo">O que há de BOM?</h1>
        <p className="subtitulo">Selecione a cor da roleta</p>
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
