export default function ColorSwatchButton({ cor, selected, onClick }) {
  return (
    <button
      type="button"
      className={`color-swatch${selected ? ' color-swatch--selected' : ''}`}
      style={{ backgroundColor: cor.hex }}
      onClick={onClick}
      aria-label={cor.label}
      title={cor.label}
    />
  )
}
