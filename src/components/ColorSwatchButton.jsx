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
      <span className="color-swatch__circle" style={{ backgroundColor: cor.hex }} />
      <span className="color-swatch__label">{cor.label}</span>
    </button>
  )
}
