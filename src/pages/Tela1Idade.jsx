import { useNavigate } from 'react-router-dom'
import { FAIXAS_ETARIAS } from '../constants/gameData'
import { useApp } from '../context/AppContext'
import logo from '../assets/logo/logo.webp'

export default function Tela1Idade() {
  const navigate = useNavigate()
  const { setSelectedAge, setSelectedColor } = useApp()

  function handleSelect(faixa) {
    setSelectedColor(null)
    setSelectedAge(faixa)
    navigate('/roleta')
  }

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
        <p className="subtitulo">Selecione sua faixa etária</p>
        <div className="grid-idades">
          {FAIXAS_ETARIAS.map((faixa) => (
            <button
              key={faixa.value}
              type="button"
              className="btn-idade"
              onClick={() => handleSelect(faixa.value)}
            >
              <span className="btn-idade__emoji">{faixa.emoji}</span>
              <span className="btn-idade__label">{faixa.label} anos</span>
              <span className="btn-idade__hint">{faixa.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
