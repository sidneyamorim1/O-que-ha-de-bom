import azul from '../../Imagens/icones-roleta/Azul 1.svg'
import amarelo from '../../Imagens/icones-roleta/amarelo.svg'
import vermelho from '../../Imagens/icones-roleta/vermelho.svg'
import roxo from '../../Imagens/icones-roleta/roxo.svg'
import verde from '../../Imagens/icones-roleta/verde.svg'
import laranja from '../../Imagens/icones-roleta/Laranja.svg'

const icones = { azul, amarelo, vermelho, roxo, verde, laranja }

export default function ColorSwatchButton({ cor, selected, onClick }) {
  return (
    <button
      type="button"
      className={`color-swatch${selected ? ' color-swatch--selected' : ''}`}
      onClick={onClick}
      aria-label={cor.label}
      title={cor.label}
      style={{ '--swatch-glow': `${cor.hex}66` }}
    >
      <img
        className="color-swatch__icon"
        src={icones[cor.value]}
        alt=""
        width="135"
        height="90"
      />
      <span className="color-swatch__label">{cor.label}</span>
    </button>
  )
}
