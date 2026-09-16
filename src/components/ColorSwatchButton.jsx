import azul from '../assets/icones-roleta/azul.webp'
import amarelo from '../assets/icones-roleta/amarelo.webp'
import vermelho from '../assets/icones-roleta/vermelho.webp'
import roxo from '../assets/icones-roleta/roxo.webp'
import verde from '../assets/icones-roleta/verde.webp'
import laranja from '../assets/icones-roleta/laranja.webp'

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
