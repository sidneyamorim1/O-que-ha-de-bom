import { useNavigate } from 'react-router-dom'
import { FAIXAS_ETARIAS } from '../constants/gameData'
import { useApp } from '../context/AppContext'

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
        <h1 className="titulo">
          O que há de
          <br />
          BOM?
        </h1>
        <p className="subtitulo">Selecione sua idade</p>
        <div className="grid-idades">
          {FAIXAS_ETARIAS.map((faixa) => (
            <button
              key={faixa.value}
              type="button"
              className="btn-idade"
              onClick={() => handleSelect(faixa.value)}
            >
              {faixa.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
