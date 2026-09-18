import { useNavigate } from 'react-router-dom'
import { FAIXAS_PROFESSOR } from '../constants/gameData'
import logo from '../assets/logo/logo.webp'

export default function EscolhaFaixaProfessor() {
  const navigate = useNavigate()

  return (
    <div className="page page--single-screen">
      <div className="card card--admin">
        <div className="game-card-topbar">
          <button type="button" className="game-card-link" onClick={() => navigate('/escolha')}>
            Trocar perfil
          </button>
        </div>

        <div className="titulo-wrapper titulo-wrapper--compacto">
          <img src={logo} alt="O que há de Bom?" className="titulo-logo titulo-logo--otimizado" />
          <h1 className="titulo titulo--principal">
            O que há de <span>BOM?</span>
          </h1>
        </div>
        <p className="subtitulo subtitulo--clean">Selecione a faixa etária da formação:</p>

        <div className="grid-opcoes">
          {FAIXAS_PROFESSOR.map((f) => (
            <button
              key={f.value}
              type="button"
              className="btn-opcao btn-opcao--prof"
              onClick={() => navigate(`/professores/${f.value}/cor`)}
            >
              <span className="btn-opcao__emoji">📚</span>
              <span className="btn-opcao__label">Faixa {f.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className="btn-voltar" onClick={() => navigate('/escolha')}>
          ← Voltar para Escolha de Perfil
        </button>
      </div>
    </div>
  )
}
