import { useNavigate } from 'react-router-dom'
import { FAIXAS_PROFESSOR } from '../constants/gameData'
import logo from '../assets/logo/logo.webp'

export default function EscolhaFaixaProfessor() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="card card--admin">
        <div className="titulo-wrapper">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo" />
          <h1 className="titulo">
            O que há de
            <br />
            BOM?
          </h1>
        </div>
        <p className="subtitulo">Faixa etária</p>
        <div className="grid-opcoes">
          {FAIXAS_PROFESSOR.map((f) => (
            <button
              key={f.value}
              type="button"
              className="btn-opcao"
              onClick={() => navigate(`/professores/${f.value}/cor`)}
            >
              <span className="btn-opcao__label">{f.label}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn-voltar" onClick={() => navigate('/escolha')}>
          ← Voltar
        </button>
      </div>
    </div>
  )
}
