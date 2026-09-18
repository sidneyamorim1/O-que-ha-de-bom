import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CORES, FAIXAS_PROFESSOR } from '../constants/gameData'
import ColorSwatchButton from '../components/ColorSwatchButton'
import logo from '../assets/logo/logo.webp'

export default function ProfessorCor() {
  const navigate = useNavigate()
  const { faixa } = useParams()
  const faixaValida = FAIXAS_PROFESSOR.some((f) => f.value === faixa)

  useEffect(() => {
    if (!faixaValida) navigate('/escolha/professores', { replace: true })
  }, [faixaValida, navigate])

  if (!faixaValida) return null

  return (
    <div className="page page--single-screen">
      <div className="card card--roleta">
        <div className="game-card-topbar">
          <button type="button" className="game-card-link" onClick={() => navigate('/escolha/professores')}>
            Trocar faixa
          </button>
        </div>

        <div className="titulo-wrapper titulo-wrapper--compacto">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo titulo-logo--otimizado" />
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Qual cor saiu na roleta pedagógica?</p>

        <div className="grid-cores">
          {CORES.map((cor) => (
            <ColorSwatchButton
              key={cor.value}
              cor={cor}
              onClick={() => navigate(`/professores/${faixa}/${cor.value}`)}
            />
          ))}
        </div>

        <button type="button" className="btn-voltar" onClick={() => navigate('/escolha/professores')}>
          ← Voltar para seleção de faixa
        </button>
      </div>
    </div>
  )
}
